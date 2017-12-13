import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';

@injectable()
export class Utils {
    constructor() {}
}