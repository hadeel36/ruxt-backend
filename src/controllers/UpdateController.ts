import { inject, injectable } from 'inversify';
import * as express from 'express';

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
        if (req.header('Authorisation') === this.env.Auth) {
            next();
        } else {
            res.status(401).send({
                message: 'Not authorized to make the request'
            });
        }
    }

    updateRankings:express.RequestHandler = (req, res) => {
        res.send('OK');
    }
}