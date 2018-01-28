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

    constructor(@inject(TYPES.ElasticSearchClient) esClient:ElasticSearchClient,
        @inject(TYPES.Environment) env:IEnviroment) {
        this.esClient = esClient;
        this.env = env;

        this.application = express();
        this.application.use(this.authMiddleware);
        this.application.use('/rankings', this.updateRankings);
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

    // CSV format
    // <rank>,<domain>
    // <rank>,<domain>
    updateRankings:express.RequestHandler = (req, res) => {
        const rawFileStream = RxNode.fromStream(req.pipe(csv()));
        rawFileStream.map((line:string) => {
            return { rank:line[0], domain: line[1] }
        })
        .filter(rankObj => !isNaN(parseInt(rankObj.rank))) // Removing bad ranks...
        .map(rankObj => ({
            rank: parseInt(rankObj.rank),
            domain: rankObj.domain
        }))
        .subscribe((d) => {
            console.log(d);
        });
        res.send('OK');
    }
}