import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { ElasticSearchClient } from '../clients/ElasticSearchClient';

@injectable()
export class Utils {
    esClient: ElasticSearchClient;

    constructor(@inject(TYPES.ElasticSearchClient) esClient:ElasticSearchClient) {
        this.esClient = esClient;
    }

    public foo(){
        return '';
    }  
}