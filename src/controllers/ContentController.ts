import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { BigQueryCalculatorService } from '../services/BigQueryCalculatorService';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';

@injectable()
export class ContentController implements IController {
    application: express.Application;
    bigQueryCalculatorService: BigQueryCalculatorService;
    elasticSearchClient: ElasticSearchClient;

    constructor(@inject(TYPES.BigQueryCalculatorService) bigQueryCalculatorService:BigQueryCalculatorService,
                @inject(TYPES.ElasticSearchClient) elasticSearchClient:ElasticSearchClient,
                @inject(TYPES.Environment) env:any) {
        this.bigQueryCalculatorService = bigQueryCalculatorService;
        this.elasticSearchClient = elasticSearchClient;

        this.application = express();

        this.application.use(bodyParser.json());

        this.application.post('/content', this.handleContentRequest);
    }

    handleContentRequest:express.RequestHandler = async (req, res) => {
        const requestObject:IRequestFormat = req.body;
        
        const existingDocument = await this.elasticSearchClient.search(requestObject);
        console.log(existingDocument);
        res.send('Hello world');
    }
}