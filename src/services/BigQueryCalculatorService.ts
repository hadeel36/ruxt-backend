import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { BigQueryClient } from '../clients/BigQueryClient';
import { BigQueryTransformerService } from './BigQueryTransformerService';
import { IRequestFormat } from '../interfaces';
import { request } from 'https';

@injectable()
export class BigQueryCalculatorService {
    private bigQueryClient:BigQueryClient;
    private bigQueryTransformerService:BigQueryTransformerService;

    constructor(@inject(TYPES.BigQueryClient) bigQueryClient:BigQueryClient, 
        @inject(TYPES.BigQueryTransformerService) bigQueryTransformerService: BigQueryTransformerService) {
        this.bigQueryClient = bigQueryClient;
        this.bigQueryTransformerService = bigQueryTransformerService;
    }

    private async getResults(dimension, requestObject:IRequestFormat) {
        const QueryStatements = [];
        const query = this.bigQueryTransformerService.generateSql(requestObject, dimension);
        QueryStatements.push(query);
        for (let i = 1; i <= 10; i++) {
            QueryStatements.push(this.bigQueryTransformerService.generateSql(requestObject, dimension, i));
        }

        const QueryPromises = QueryStatements.map((sql) => this.bigQueryClient.doQuery(sql));

        console.log('Querying...');
        const data = (await Promise.all(QueryPromises)).map((result) => result[0].f0_);
        
        const totalDensity = data[0];
        const probabilities = {};
        for (let i = 1; i <=10; i++) {
            const probability = data[i]/totalDensity;
            probabilities[i] = probability;
        }

        console.log(probabilities);
        return probabilities;
    }

    async getData(requestObject:IRequestFormat):Promise<any> {

        const [FCPProbabilites, onLoadProbabilies] = await Promise.all([
            this.getResults("fcp", requestObject),
            this.getResults("onload", requestObject),
        ]);

        return {
            bam: {
                fcp: FCPProbabilites,
                onload: onLoadProbabilies,
           },
        };
    }
}