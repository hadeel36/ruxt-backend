import * as BigQuery from '@google-cloud/bigquery';

import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { IEnviroment } from '../env';

@injectable()
export class BigQueryConnection {
    public bgClient;

    constructor(@inject(TYPES.Environment) env:IEnviroment) {
        const { BigQueryProjectId } = env;
        this.bgClient = new BigQuery();
    }
}