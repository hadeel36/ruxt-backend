import * as BigQuery from '@google-cloud/bigquery';

import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class BigQueryConnection {
    public bgClient;

    constructor(@inject (TYPES.Environment) env: any) {
        const { bigQueryProjectId } = env;
        this.bgClient = new BigQuery();
    }
}