import { Container } from "inversify";
import * as inversify from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as appInterfaces from "./interfaces";
import * as env from './env';
import { ContentController } from './controllers/ContentController';
import { IOHalter } from './utils/IOHalter';
import { ElasticSearchClient } from './clients/ElasticSearchClient';
import { BigQueryClient } from './clients/BigQueryClient';
import { ElasticSearchConnection } from "./connections/ElasticSearchConnection";
import { BigQueryConnection } from "./connections/BigQueryConnection";
import { BigQueryTransformerService } from "./services/BigQueryTransformerService";
import { BigQueryCalculatorService } from "./services/BigQueryCalculatorService";

const container = new Container();

// Used to stop all HTTP I/O till all I/O blocking promises are resolved...
container.bind<IOHalter>(TYPES.IOHalter).to(IOHalter).inSingletonScope();

container.bind<any>(TYPES.Environment).toConstantValue(env);
container.bind<ElasticSearchConnection>(TYPES.ElasticSearchConnection).toConstantValue(new ElasticSearchConnection(env.EsHost));
container.bind<BigQueryConnection>(TYPES.BigQueryConnection).toConstantValue(new BigQueryConnection(env.BigQueryProjectId));
container.bind<appInterfaces.IController>(TYPES.ContentController).to(ContentController).inSingletonScope();
container.bind<ElasticSearchClient>(TYPES.ElasticSearchClient).to(ElasticSearchClient);
container.bind<BigQueryClient>(TYPES.BigQueryClient).to(BigQueryClient);
container.bind<BigQueryTransformerService>(TYPES.BigQueryTransformerService).to(BigQueryTransformerService);
container.bind<BigQueryCalculatorService>(TYPES.BigQueryCalculatorService).to(BigQueryCalculatorService);


export { container };