import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { BigQueryClient } from '../clients/BigQueryClient';
import { BigQueryTransformerService } from './BigQueryTransformerService';
import { IRequestFormat } from '../interfaces';

@injectable()
export class BigQueryCalculatorService {
    private bigQueryClient;
    private bigQueryTransformerService;

    constructor(@inject(TYPES.BigQueryClient) bigQueryClient:BigQueryClient, @inject(TYPES.BigQueryTransformerService) bigQueryTransformerService: BigQueryTransformerService) {
        this.bigQueryClient = bigQueryClient;
        this.bigQueryTransformerService = bigQueryTransformerService;
    }

    getData() {
        console.log('BAM');
        const query = this.bigQueryTransformerService.generateSql();
        this.bigQueryClient.doQuery(query).then(data => {
            console.log(data);
        }).catch(e => {
            console.log(e);
        });
    }
}