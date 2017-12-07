import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { IController } from '../interfaces';
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
}