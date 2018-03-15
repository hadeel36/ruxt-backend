import { inject, injectable } from 'inversify';
import * as express from 'express';
import * as Rx from 'rxjs/Rx';
import * as RxNode from 'rx-node';
import * as csv from 'csv-parse';

import { IController } from '../interfaces';
import { TYPES } from '../types';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';
import { IEnviroment } from '../env';

@injectable()
export class UpdateController implements IController {
    public application: express.Application;

    private esClient: ElasticSearchClient;
    private env: IEnviroment;
    private processing: boolean; // A simple semaphore to reflect whether the system is processing the CSV data internally, since it's a single process

    constructor(@inject(TYPES.ElasticSearchClient) esClient:ElasticSearchClient,
        @inject(TYPES.Environment) env:IEnviroment) {
        this.esClient = esClient;
        this.env = env;
        this.processing = false;
        this.application = express();

        this.application.use(this.authMiddleware);
        this.application.use(this.processingSemaphoreMiddleware);
        this.application.post('/rankings', this.updateRankings); 
        this.application.get('/rankings/status', this.getUpdateStatus);
    }

    authMiddleware:express.RequestHandler = (req, res, next) => {
        if (req.header('Authorization') === this.env.Auth) {
            next();
        } else {
            res.status(401).send({
                message: 'Not authorized to make the request'
            });
        }
    }

    processingSemaphoreMiddleware:express.RequestHandler = (req, res, next) => {
        if (this.processing) {
            res.status(403).send({
                processing: true
            });
        } else {
            next();
        }
    }

    getUpdateStatus:express.RequestHandler = (req, res) => {
        res.send({
            processing: this.processing
        });
    }

    // Takes in CSV line parses
    // TODO: This is inefficient and does lots of stuff is in-memory... possibly have a
    // better solution, maybe using scoring or bulk update feature in ES.
    // There's a semaphore to handle race conditions
    private updateElasticDocuments = (fileStream) => {
        return fileStream
            .map((line:string[]) => ({ rank:line[0], domain: line[1] }))
            .filter(rankObj => !isNaN(parseInt(rankObj.rank))) // Removing bad ranks...
            .map(rankObj => ({
                rank: parseInt(rankObj.rank),
                domain: rankObj.domain
            }))
            .flatMap(rankObj => {
                return this.esClient.searchByPrimaryOrigin(rankObj.domain)
                    .then(docs => ({
                        docs,
                        rankToSet: rankObj.rank
                    }));
            })
            .flatMap(rankSetObj => {
                return Rx.Observable.from(rankSetObj.docs.map(doc => ({
                    doc, 
                    rankToSet: rankSetObj.rankToSet
                })));
            })
            .flatMap(rankDocObject => {
                return this.esClient.setOriginRank(
                    rankDocObject.doc._id, 
                    rankDocObject.rankToSet,
                    rankDocObject.doc._source
                );
            });
    }

    // CSV format
    // <rank>,<domain>
    // <rank>,<domain>
    updateRankings:express.RequestHandler = (req, res) => {
        this.processing = true;

        const rawFileStream = RxNode.fromStream(req.pipe(csv()));

        rawFileStream.subscribe(() => {}, () => {}, () => {
            res.send({
                uploadingComplete: true
            });
        });

        this.updateElasticDocuments(rawFileStream).subscribe((d) => {}, () => {}, () => {
            this.processing = false;
        });
    }
}