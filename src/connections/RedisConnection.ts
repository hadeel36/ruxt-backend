import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as redis from 'redis';

@injectable()
export class RedisConnection {
    redisClient;

    constructor(redisHost:string) {
        this.redisClient = redis.createClient(6379, redisHost);
    }   
}