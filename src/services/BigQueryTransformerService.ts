import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { IRequestFormat } from '../interfaces';

@injectable()
export class BigQueryTransformerService {
    public datasetName = 'chrome-ux-report.chrome_ux_report.201710';

    public generateSql(requestObject:IRequestFormat, dimension, time = null) {
		let histogramName;

		if (dimension === "fcp") {
			histogramName = "first_contentful_paint";
		} else if (dimension === "onload") {
			histogramName = "onload";
		}

    	let query = `
    	SELECT
  			SUM(${dimension}.density)
		FROM \`${this.datasetName}\`,
  			UNNEST(${histogramName}.histogram.bin) AS ${dimension}
		WHERE
  			origin = "${requestObject.origin}"
		`;

		if (requestObject.connection != "all") {
			query += `AND effective_connection_type.name = "${requestObject.connection}"`;
		}

		if (requestObject.device != "all") {
			query += `AND form_factor.name = "${requestObject.device}"`
		}
			
		if (time) {
			query += `AND ${dimension}.end <= ${time * 1000}`;
		}
		return query;
    }
}