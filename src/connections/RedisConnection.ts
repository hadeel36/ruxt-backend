import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as redis from 'redis';
import { IEnviroment } from '../env';

@injectable()
export class RedisConnection {
    redisClient;

    constructor(@inject(TYPES.Environment) env:IEnviroment) {
        const { RedisHost, RedisPort } = env;
        this.redisClient = redis.createClient(RedisPort, RedisHost);
    }   
}