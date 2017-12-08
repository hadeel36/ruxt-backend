import * as elasticsearch from 'elasticsearch';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

@injectable()
export class ElasticSearchConnection {
    esClient:elasticsearch.Client;

    constructor(esHost:string) {
        this.esClient = new elasticsearch.Client({
            host: esHost,
            log: 'trace'
        });
    }
}