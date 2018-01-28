export interface IEnviroment {
    NodePort: number;
    Auth: string;
    EsHost: string;
    RedisHost: string;
    RedisPort: number;
    BigQueryProjectId: string;
    BaseUri: string;
    OriginCount: number;
    environment: string;
    frontendDomain: string;
}

export const env:IEnviroment {
    NodePort: isNaN(parseInt(process.env.PORT)) ? 5000 : parseInt(process.env.PORT),
    Auth: process.env.AUTH || 'no-auth',
    EsHost: process.env.ESHOST || 'localhost:9200',
    RedisHost: process.env.REDIS_HOST || 'localhost',
    RedisPort: isNaN(parseInt(process.env.REDIS_PORT)) ? 6379 : parseInt(process.env.REDIS_PORT),
    BigQueryProjectId: process.env.PROJECT_ID || 'chrome-ux-report-185710',
    BaseUri: process.env.BASE_URI || null,
    OriginCount: isNaN(parseInt(process.env.ORIGIN_COUNT)) ? 10000 : parseInt(process.env.ORIGIN_COUNT),
    environment: process.env.NODE_ENV || 'development',
    frontendDomain: process.env.FRONTEND_DOMAIN || 'https://ruxt.dexecure.com'
}