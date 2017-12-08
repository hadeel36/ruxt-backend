import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { IController, IRequestFormat } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { promisify } from 'util';
import { ElasticSearchConnection } from '../connections/ElasticSearchConnection';

@injectable()
export class ElasticSearchClient {
    public esConnection:ElasticSearchConnection;

    constructor(@inject(TYPES.ElasticSearchConnection) esConnection:ElasticSearchConnection, @inject(TYPES.IOHalter) ioHalter:IOHalter) {
        this.esConnection = esConnection;

        ioHalter.addPromise(promisify(this.esConnection.esClient.ping)({requestTimeout: 1000}));
    }

    public addDocument(document:any):Promise<any> {
        return Promise.resolve();
    }

    public searchForDocument(searchParams:any):Promise<any> {
        return Promise.resolve();
    }

    public getDocument(documentId:string):Promise<any> {
        return Promise.resolve();
    }

    public getDocumentByParameter(requestObject:IRequestFormat):Promise<any> {
        return Promise.resolve();
    }
}