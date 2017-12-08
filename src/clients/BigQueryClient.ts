import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { BigQueryConnection } from '../connections/BigQueryConnection';
import { BigQueryTransformerService } from '../services/BigQueryTransformerService';
import { IRequestFormat } from '../interfaces';

@injectable()
export class BigQueryClient {
    public bigQueryConnection:BigQueryConnection;

    constructor(@inject(TYPES.BigQueryConnection) bigQueryConnection:BigQueryConnection) {
        this.bigQueryConnection = bigQueryConnection;
    }

    doQuery(query:string):Promise<any> {
        return this.bigQueryConnection.bgClient.query({query});
    }
}