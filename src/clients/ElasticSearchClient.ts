import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as escapeElastic from 'elasticsearch-sanitize';

import { IController, IRequestFormat, IStorageObject } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { promisify } from 'util';
import { ElasticSearchConnection } from '../connections/ElasticSearchConnection';

export interface IElasticSearchHit {
    _source: any;
    _index: string;
    _id: string;
    _type: string;
    _score: number;
}

export interface IElasticSearchResponse {
    hits: {
        total: number;
        max_score: number;
        hits: IElasticSearchHit[];
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

        const ioPromise = promisify(this.esConnection.esClient.ping.bind(this.esConnection.esClient))({requestTimeout: 10000});

        ioHalter.addPromise(ioPromise);
        ioHalter.addPromise(this.createContentIndex());
        ioHalter.addPromise(this.createOriginIndex());
    }

    private createContentIndex():Promise<any> {
        return promisify(this.esConnection.esClient.indices.create.bind(this.esConnection.esClient))({
            index: this.esIndex,
            body: {
                mappings: {
                    all: {
                        properties: {
                            content: {
                                type: 'text',
                                index: false // Don't index the actual content that's calculated
                            }
                        }
                    }
                }
            }
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

    public addOrigin(origin:string):Promise<any> {
        return promisify(this.esConnection.esClient.create.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            type: this.esOriginType,
            id: origin,
            body: {origin}
        });
    }

    public setOriginRank(id:string, rank:number, body: {origin: string}):Promise<any> {
        return promisify(this.esConnection.esClient.index.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            type: this.esOriginType,
            id: id,
            body: {
                origin: body.origin,
                rank
            }
        });
    }

    public searchExactOrigin(origin:string):Promise<boolean> {

        const searchQueryObject = {
            query_string: {
                fields: ["origin"],
                query: `${escapeElastic(origin)}`,
            }
        };

        return promisify(this.esConnection.esClient.search.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            body: {
                query: searchQueryObject
            }
        })
        .then((data => data.hits.hits.map(doc => doc._source)))
        .then((arr => arr.length > 0));
    }

    private cleanOrigin = (origin:string) => {
        if (origin.startsWith("https://")) {
            origin = origin.substr("https://".length)
        } else if (origin.startsWith("http://")) {
            origin = origin.substr("http://".length)
        } else if (origin.startsWith("http:")) {
            origin = origin.substr("http:".length)
        } else if (origin.startsWith("https:")) {
            origin = origin.substr("https:".length)
        }
        origin = origin.replace(/\//g, '');
        origin = origin.replace(/:/g, '');

        return origin;
    }

    public searchByPrimaryOrigin(origin:string):Promise<IElasticSearchHit[]> {
        origin = this.cleanOrigin(origin);

        const searchQueryObject = {
            query_string: {
                fields: ["origin"],
                query: `(http://${origin}*) 
                OR (https://${origin}*) 
                OR (http://www\.${origin}*) 
                OR (https://www\.${origin}*)`,
            }
        };

        return promisify(this.esConnection.esClient.search.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            body: {
                query: searchQueryObject
            }
        }).then(data => data.hits.hits);
    }

    public searchByOrigin(origin:string):Promise<string[]> {
        origin = this.cleanOrigin(origin);

        const searchQueryObject = {
            query_string: {
                fields: ["origin"],
                query: `(http://*${origin}*) OR (https://*${origin}*)`,
            }
        };

        return promisify(this.esConnection.esClient.search.bind(this.esConnection.esClient))({
            index: this.esOriginIndex,
            body: {
                query: searchQueryObject,
                // sort: [{ 
                //     rank: {
                //         order: "asc"
                //     }
                // }]
            }
        })
        .then((data => data.hits.hits.map(doc => doc._source)))
        .then((arr => arr.sort((a, b) => a.origin.length - b.origin.length)))
    }

}