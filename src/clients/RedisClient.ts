import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';

import { IController, IRequestFormat, IStorageObject } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { promisify } from 'util';
import { RedisConnection } from '../connections/RedisConnection';

@injectable()
export class RedisClient {
    private redisConnection:RedisConnection;

    constructor(@inject(TYPES.RedisConnection) redisConnection:RedisConnection, @inject(TYPES.IOHalter) ioHalter:IOHalter) {
        this.redisConnection = redisConnection;

        const ioPromise = promisify(this.redisConnection.redisClient.ping.bind(this.redisConnection.redisClient))({requestTimeout: 1000});

        ioHalter.addPromise(ioPromise);
    }

    public addDocument(id:string, document:IRequestFormat):Promise<any> {
        return promisify(this.redisConnection.redisClient.set
            .bind(this.redisConnection.redisClient))(id, JSON.stringify(document));
    
    }

    public getSpecificDocument(documentId:String):Promise<any> {
        return promisify(this.redisConnection.redisClient.get.bind(this.redisConnection.redisClient))(documentId);
    }
}