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
        this.application.post('/search', this.handleSearchRequest);
    }

    handleSearchRequest:express.RequestHandler = async (req, res) => {
        const requestObject:IRequestFormat = req.body;
        // To prevent auto field type mapping of ElasticSearch
        if (requestObject.connection) {
            requestObject.connection = requestObject.connection.toLowerCase();
        }

        const results = await this.elasticSearchClient.search(requestObject);

        res.send(results.hits);
    }

    handleContentRequest:express.RequestHandler = async (req, res) => {
        const requestObject:IRequestFormat = req.body;
        // To prevent auto field type mapping of ElasticSearch
        requestObject.connection = requestObject.connection.toLowerCase();
        
        const results = await this.elasticSearchClient.search(requestObject);
        
        if (results.hits.hits.length === 0) {
            const newData = await this.bigQueryCalculatorService.getData();
            const newDocumentId = Object.keys(requestObject).reduce((acc, key) => acc + requestObject[key], '');
            const newDocumentToStore = _.extend(requestObject, {content: newData});
            try {
                await this.elasticSearchClient.addDocument(newDocumentId, newDocumentToStore);
            } catch(e) {
                console.log('Failed to cache');
            }
            
            res.send(newData);
        } else {
            res.send(results.hits.hits[0]._source.content);
        }
    }
}