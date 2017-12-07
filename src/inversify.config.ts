import { Container } from "inversify";
import * as inversify from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as appInterfaces from "./interfaces";
import * as env from './env';
import { ContentController } from './controllers/ContentController';
import { IOHalter } from './utils/IOHalter';

const container = new Container();

// Used to stop all HTTP I/O till all promises are resolved...
container.bind<IOHalter>(TYPES.IOHalter).to(IOHalter).inSingletonScope();

container.bind<appInterfaces.IController>(TYPES.ContentController).to(ContentController).inSingletonScope();


export { container };