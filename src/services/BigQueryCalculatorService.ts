import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { BigQueryClient } from '../clients/BigQueryClient';
import { BigQueryTransformerService } from './BigQueryTransformerService';
import { IRequestFormat } from '../interfaces';

@injectable()
export class BigQueryCalculatorService {
    private bigQueryClient:BigQueryClient;
    private bigQueryTransformerService:BigQueryTransformerService;

    constructor(@inject(TYPES.BigQueryClient) bigQueryClient:BigQueryClient, 
        @inject(TYPES.BigQueryTransformerService) bigQueryTransformerService: BigQueryTransformerService) {
        this.bigQueryClient = bigQueryClient;
        this.bigQueryTransformerService = bigQueryTransformerService;
    }

    async getData(requestObject:IRequestFormat):Promise<any> {
        const query = this.bigQueryTransformerService.generateSql(requestObject);
        console.log('Querying...');
        console.log(query);
        const data = await this.bigQueryClient.doQuery(query);
        return {bam: data[0].f0_};
    }
}