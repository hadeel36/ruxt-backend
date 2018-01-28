import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as AWS from 'aws-sdk';
import * as elasticsearch from 'elasticsearch';

@injectable()
export class ElasticSearchConnection {
    esClient:elasticsearch.Client;

    constructor(@inject(TYPES.Environment) env:any) {
        const { environment, esHost } = env.environment;

        if (environment == "production") {
            const options = {
                hosts: [esHost],
                connectionClass: require('http-aws-es'),
                awsConfig: new AWS.Config({ region: 'us-east-1' }), // set an aws config e.g. for multiple clients to different regions
                httpOptions: {} // set httpOptions on aws-sdk's request. default to aws-sdk's config.httpOptions
            };
            this.esClient = require('elasticsearch').Client(options);
        } else {
            this.esClient = new elasticsearch.Client({
                host: esHost,
                log: 'trace'
            });
        }
    }
}