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
    private env:any;

    constructor(@inject(TYPES.BigQueryClient) bigQueryClient:BigQueryClient, 
        @inject(TYPES.BigQueryTransformerService) bigQueryTransformerService: BigQueryTransformerService,
        @inject(TYPES.Environment) env:any) {
        this.env = env;
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
        // This might be a bad idea... TODO
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
        if (this.env.environment === 'production') {
            const [fcpProbabilities, onloadProbabilites] = await this.getResults(requestObject);

            return {
                bam: {
                    fcp: fcpProbabilities,
                    onload: onloadProbabilites,
                }
            };
        } else {
            return { // Dummy data
                bam: {
                    fcp: [1,2,3,4],
                    onload: [1.5, 2.5, 2.25]
                }
            };
        }
    }
}