import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import * as elasticsearch from 'elasticsearch';

@injectable()
export class ElasticSearchConnection {
    esClient:elasticsearch.Client;

    constructor(esHost:string) {
        this.esClient = new elasticsearch.Client({
            host: esHost
        });
    }
}