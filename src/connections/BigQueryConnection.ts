import * as BigQuery from '@google-cloud/bigquery';

import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class BigQueryConnection {
    public bgClient;

    constructor(private bigQueryProjectId:string) {
        this.bgClient = new BigQuery({
            projectId: bigQueryProjectId
        });
    }
}