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
        // Uncomment this line for actual querying
        // return this.bigQueryConnection.bgClient.query({query});

        // Dummy
        return Promise.resolve([
            'some data',
            'some more data',
            'whatever data'
        ]);
    }
}