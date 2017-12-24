import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';
import * as _ from 'lodash';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { BigQueryCalculatorService } from '../services/BigQueryCalculatorService';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';
import { RedisClient } from '../clients/RedisClient';
import { Utils } from '../utils/Utils';

@injectable()
export class ContentController implements IController {
    application: express.Application;
    bigQueryCalculatorService: BigQueryCalculatorService;
    elasticSearchClient: ElasticSearchClient;
    redisClient: RedisClient;

    constructor(@inject(TYPES.BigQueryCalculatorService) bigQueryCalculatorService:BigQueryCalculatorService,
                @inject(TYPES.ElasticSearchClient) elasticSearchClient:ElasticSearchClient,
                @inject(TYPES.Environment) env:any,
                @inject(TYPES.Utils) utils:Utils, @inject(TYPES.RedisClient) redisClient:RedisClient) {
        this.bigQueryCalculatorService = bigQueryCalculatorService;
        this.elasticSearchClient = elasticSearchClient;
        this.redisClient = redisClient;

        this.application = express();

        this.application.use(bodyParser.json());

        this.application.post('/content', this.handleContentRequest);
        this.application.post('/search', this.handleSearchRequest);
    }

    handleSearchRequest:express.RequestHandler = async (req, res) => {
        let origin = req.body.origin;

        const results = await this.elasticSearchClient.searchByOrigin(origin);

        res.send(results);
    }

    handleContentRequest:express.RequestHandler = async (req, res) => {
        const requiredProperties = ['connection', 'device', 'origin'];
        
        // Check to see if there are no bad request...
        if (requiredProperties.reduce((acc, key) => acc + (req.body.hasOwnProperty(key) ? 1 : 0), 0) === requiredProperties.length) {
            const requestObject:IRequestFormat = {
                connection: req.body.connection,
                device: req.body.device,
                origin: req.body.origin
            };
            
            const documentID = Object.keys(requestObject).reduce((acc, key) => acc + requestObject[key], '');
            const results = await this.redisClient.getSpecificDocument(documentID);

            const doesOriginExist = (await this.elasticSearchClient.searchExactOrigin(req.body.origin));
            if (!doesOriginExist) {
                console.log(`origin does not exist ${req.body.origin}`);
                res.status(400).send({
                    message: "origin does not exist",
                });
            } else if (!results) {
                try {
                    const newData = await this.bigQueryCalculatorService.getData(requestObject);

                    // TODO Check if valid data came, and act accordingly
                    // Adding in content cache
                    try {
                        await this.redisClient.addDocument(documentID, newData);
                    } catch(e) {
                        console.log('Failed to cache', e);
                    }
                    
                    res.send(newData);
                } catch (err) {
                    res.status(400).send({
                        message: err.message
                    });
                }
            } else {
                res.send(JSON.parse(results));
            }
        } else {
            res.status(400).send({
                message: "Required parameter missing"
            });
        }
    }
}
