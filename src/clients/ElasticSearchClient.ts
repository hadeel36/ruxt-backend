import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { promisify } from 'util';
import { ElasticSearchConnection } from '../connections/ElasticSearchConnection';

@injectable()
export class ElasticSearchClient {
    private esConnection:ElasticSearchConnection;

    private esIndex = 'contentIndex';
    private esType = 'all';

    constructor(@inject(TYPES.ElasticSearchConnection) esConnection:ElasticSearchConnection, @inject(TYPES.IOHalter) ioHalter:IOHalter) {
        this.esConnection = esConnection;

        ioHalter.addPromise(promisify(this.esConnection.esClient.ping)({requestTimeout: 1000}));
    }

    public addDocument(document:any):Promise<any> {
        return promisify(this.esConnection.esClient.create)({
            index: this.esIndex,
            type: this.esType,
            body: document
        });
    }

    public search(searchParamObject:IRequestFormat):Promise<any> {
        return promisify(this.esConnection.esClient.search)({
            index: this.esIndex,
            body: {
                query: {
                    match: {
                        searchParamObject
                    }
                }
            }
        })
    }
}