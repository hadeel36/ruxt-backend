import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class BigQueryTransformerService {
    public datasetName = 'chrome_ux_report';

    public generateSql() {
       return `SELECT COUNT(*) FROM ${this.datasetName}`; 
    }
}