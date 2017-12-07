import * as express from 'express';
import * as expressLogger from 'express-logging';
import * as logger from 'logops';
import * as process from 'process';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import * as interfaces from './interfaces';
import { container } from './inversify.config';
import { IOHalter } from './utils/IOHalter';
import { TYPES } from './types';
import { NodePort } from './env';

const app = express();

app.set('port', NodePort);

app.use(expressLogger(logger));
app.use(cors({origin: true}));
app.use(bodyParser.json())

const initApplication = () => {
    app.listen(app.get('port'), () => {
        console.log(`Application is listening on PORT ${app.get('port')}`)
    });
};

const usersController = container.get<interfaces.IController>(TYPES.ContentController);

app.use(usersController.application);

// Just a status endpoint
app.get('/status', (request:express.Request, response:express.Response) => {
    response.send('OK');
});

const ioHalter = container.get<IOHalter>(TYPES.IOHalter);

Promise.all(ioHalter.getAllPromises()).then(initApplication);




