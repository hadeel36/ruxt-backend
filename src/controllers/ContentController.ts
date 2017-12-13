import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { BigQueryCalculatorService } from '../services/BigQueryCalculatorService';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';
import { Utils } from '../utils/Utils';

@injectable()
export class ContentController implements IController {
    application: express.Application;
    bigQueryCalculatorService: BigQueryCalculatorService;
    elasticSearchClient: ElasticSearchClient;

    constructor(@inject(TYPES.BigQueryCalculatorService) bigQueryCalculatorService:BigQueryCalculatorService,
                @inject(TYPES.ElasticSearchClient) elasticSearchClient:ElasticSearchClient,
                @inject(TYPES.Environment) env:any,
                @inject(TYPES.Utils) utils:Utils) {
        this.bigQueryCalculatorService = bigQueryCalculatorService;
        this.elasticSearchClient = elasticSearchClient;

        this.application = express();

        this.application.use(bodyParser.json());

        this.application.post('/content', this.handleContentRequest);
        this.application.post('/search', this.handleSearchRequest);
    }

    handleSearchRequest:express.RequestHandler = async (req, res) => {
        const origin = req.body.origin;
        const results = await this.elasticSearchClient.searchByOrigin(origin);

        res.send(results.hits.hits.map(doc => doc._source));
    }

    handleContentRequest:express.RequestHandler = async (req, res) => {
        let requestObject:IRequestFormat = {
            connection: req.body.connection.toLowerCase(), // To prevent auto field type mapping of ElasticSearch
            device: req.body.device,
            origin: req.body.origin
        };
        
        const results = await this.elasticSearchClient.getSpecificDocument(requestObject);
        
        if (results.hits.hits.length === 0) {
                const newData = await this.bigQueryCalculatorService.getData(requestObject);

                // TODO Check if valid data came, and act accordingly
                const newDocumentId = Object.keys(requestObject).reduce((acc, key) => acc + requestObject[key], '');
                const newDocumentToStore = _.extend(requestObject, {content: newData});

                // Adding in content cache
                try {
                    await this.elasticSearchClient.addDocument(newDocumentId, newDocumentToStore);
                } catch(e) {
                    console.log('Failed to cache', e);
                }

                // Adding in origin cache
                try {
                    await this.elasticSearchClient.addOrigin(requestObject.origin);
                } catch(e) {
                    console.log('Maybe origin already cached', e);
                }
                
                res.send(newData);
        } else {
            res.send(results.hits.hits[0]._source.content);
        }
    }
}
