import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { promisify } from 'util';
import { ElasticSearchConnection } from '../connections/ElasticSearchConnection';

export interface IElasticSearchResponse {
    hits: {
        total: number;
        max_score: number;
        hits: {
            _source: any;
            _index: string;
            _id: string;
            _type: string;
            _score: number;
        }[]
    }
}

@injectable()
export class ElasticSearchClient {
    private esConnection:ElasticSearchConnection;

    private esIndex = 'content-index';
    private esOriginIndex = 'origin-index';
    private esType = 'all';
    private esOriginType = 'all';

    constructor(@inject(TYPES.ElasticSearchConnection) esConnection:ElasticSearchConnection, @inject(TYPES.IOHalter) ioHalter:IOHalter) {
        this.esConnection = esConnection;

        const ioPromise = promisify(this.esConnection.esClient.ping.bind(this.esConnection.esClient))({requestTimeout: 1000});

        ioHalter.addPromise(ioPromise);
        ioHalter.addPromise(this.createOriginIndex());
        ioHalter.addPromise(this.createContentIndex());
    }

    private createContentIndex():Promise<any> {
        return promisify(this.esConnection.esClient.indices.create.bind(this.esConnection.esClient))({
            index: this.esIndex
        }).catch(_ => {
            return true;
        });
    }

    private createOriginIndex():Promise<any> {
        return promisify(this.esConnection.esClient.indices.create.bind(this.esConnection.esClient))({
            index: this.esOriginIndex
        }).catch(_ => {
            return true;
        });
    }

    public addDocument(id:string, document:any):Promise<any> {
        return promisify(this.esConnection.esClient.create.bind(this.esConnection.esClient))({
            index: this.esIndex,
            type: this.esType,
            id,
            body: document
        });
    }

    public addOrigin(origin:string):Promise<any> {
        return promisify(this.esConnection.esClient.create.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            type: this.esOriginType,
            id: origin,
            body: {origin}
        });
    }

    public searchByOrigin(origin:string):Promise<IElasticSearchResponse> {
        const searchQueryObject = {
            wildcard: {
                origin: `*${origin}*`
            }
        };

        return promisify(this.esConnection.esClient.search.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            body: {
                query: searchQueryObject
            }
        });
    }

    public getSpecificDocument(searchParamObject:IRequestFormat):Promise<IElasticSearchResponse> {
        const searchTermQueryObject = Object.keys(searchParamObject).map(key => {
            return {
                term: {
                    [key]: searchParamObject[key]
                }
            };
        });

        return promisify(this.esConnection.esClient.search.bind(this.esConnection.esClient))({
            index: this.esIndex,
            body: {
                query: {
                    bool: {
                        must: searchTermQueryObject
                    }
                }
            }
        });
    }
}