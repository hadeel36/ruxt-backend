import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { IRequestFormat } from '../interfaces';
import * as countrynames from 'countrynames';
import { IEnviroment } from '../env';

@injectable()
export class BigQueryTransformerService {
    datasetName;

    constructor(@inject(TYPES.Environment) env:IEnviroment) {
      const { BigQueryDataset } = env;
	  this.datasetName = BigQueryDataset;
    }

    public generateSql(requestObject:IRequestFormat) {
		const countryName = requestObject.country;
		if(countryName === 'all') {
			let countryAlpha2Name = countryName.toUpperCase();
		} else {
			let countryAlpha2Name = countrynames.getCode(countryName);
			this.datasetName = this.datasetName.replace('all', `country_${countryAlpha2Name.toLowerCase()}`);
		}
		
		let query = `SELECT
			'${countryName}' as country,
			origin,
			ROUND(SUM(IF(fcp.END <= 1000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t1fcp,
			ROUND(SUM(IF(fcp.END <= 2000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t2fcp,
			ROUND(SUM(IF(fcp.END <= 3000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t3fcp,
			ROUND(SUM(IF(fcp.END <= 4000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t4fcp,
			ROUND(SUM(IF(fcp.END <= 5000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t5fcp,
			ROUND(SUM(IF(fcp.END <= 6000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t6fcp,
			ROUND(SUM(IF(fcp.END <= 7000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t7fcp,
			ROUND(SUM(IF(fcp.END <= 8000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t8fcp,
			ROUND(SUM(IF(fcp.END <= 9000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t9fcp,
			ROUND(SUM(IF(fcp.END <= 10000,
				fcp.density,
				0)) / SUM(fcp.density), 3) AS t10fcp,
			ROUND(SUM(IF(onload.END <= 1000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t1onload,
			ROUND(SUM(IF(onload.END <= 2000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t2onload,
			ROUND(SUM(IF(onload.END <= 3000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t3onload,
			ROUND(SUM(IF(onload.END <= 4000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t4onload,
			ROUND(SUM(IF(onload.END <= 5000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t5onload,
			ROUND(SUM(IF(onload.END <= 6000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t6onload,
			ROUND(SUM(IF(onload.END <= 7000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t7onload,
			ROUND(SUM(IF(onload.END <= 8000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t8onload,
			ROUND(SUM(IF(onload.END <= 9000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t9onload,
			ROUND(SUM(IF(onload.END <= 10000,
				onload.density,
				0)) / SUM(onload.density), 3) AS t10onload
		FROM
			\`${this.datasetName}\`,
			UNNEST(first_contentful_paint.histogram.bin) AS fcp,
			UNNEST(onload.histogram.bin) AS onload
		WHERE
			origin IN ('${requestObject.origin}')
			${requestObject.connection !== "all" ? 'AND effective_connection_type.name = "' + requestObject.connection + '"': ''}
			${requestObject.device !== "all" ? 'AND form_factor.name = "' + requestObject.device + '"' : ''}
		GROUP BY
			origin
		`;

		return query;
    }
}