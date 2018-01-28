import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as redis from 'redis';

@injectable()
export class RedisConnection {
    redisClient;

    constructor(@inject(TYPES.Environment) env:any) {
        const { redisHost, redisPort } = env;
        this.redisClient = redis.createClient(redisPort, redisHost);
    }   
}