import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { IRequestFormat } from '../interfaces';

@injectable()
export class BigQueryTransformerService {
    public datasetName = 'chrome-ux-report.chrome_ux_report.201710';

    public generateSql(requestObject:IRequestFormat) {
       return `SELECT COUNT(*) FROM \`${this.datasetName}\``; 
    }
}