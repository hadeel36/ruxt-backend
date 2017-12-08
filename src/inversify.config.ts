import { Container } from "inversify";
import * as inversify from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as appInterfaces from "./interfaces";
import * as env from './env';
import { ContentController } from './controllers/ContentController';
import { IOHalter } from './utils/IOHalter';
import { ElasticSearchClient } from './clients/ElasticSearchClient';
import { ElasticSearchConnection } from "./connections/ElasticSearchConnection";

const container = new Container();

// Used to stop all HTTP I/O till all I/O blocking promises are resolved...
container.bind<IOHalter>(TYPES.IOHalter).to(IOHalter).inSingletonScope();

container.bind<ElasticSearchConnection>(TYPES.ElasticSearchConnection).toConstantValue(new ElasticSearchConnection(env.EsHost));
container.bind<appInterfaces.IController>(TYPES.ContentController).to(ContentController).inSingletonScope();
container.bind<ElasticSearchClient>(TYPES.ElasticSearchClient).to(ElasticSearchClient);

export { container };