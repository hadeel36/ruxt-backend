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

    getData(requestObject:IRequestFormat):Promise<any> {
        const query = this.bigQueryTransformerService.generateSql(requestObject);
        console.log('Querying...');
        console.log(query);
        return this.bigQueryClient.doQuery(query);
    }
}