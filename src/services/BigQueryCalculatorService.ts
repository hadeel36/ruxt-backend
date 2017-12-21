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

    private async getResults(requestObject:IRequestFormat) {
        const QueryStatements = [];
        const query = this.bigQueryTransformerService.generateSql(requestObject);
        console.log('Querying...');
        const data = (await this.bigQueryClient.doQuery(query))[0];
        console.log(data);
        if (!data) {
            return [null, null];
        }
        const fcpProbabilities = {};
        const onloadProbabilites = {};
        for (let i = 1; i <=10; i++) {
            fcpProbabilities[i] = data[`t${i}fcp`];
        }
        for (let i = 1; i <=10; i++) {
            onloadProbabilites[i] = data[`t${i}onload`];
        }
        return [fcpProbabilities, onloadProbabilites];
    }

    async getData(requestObject:IRequestFormat):Promise<any> {

        const [fcpProbabilities, onloadProbabilites] = await this.getResults(requestObject);

        return {
            bam: {
                fcp: fcpProbabilities,
                onload: onloadProbabilites,
           },
        };
    }
}