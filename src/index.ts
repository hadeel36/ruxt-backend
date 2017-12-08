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
import { NodePort, BaseUri } from './env';

const app = express();

app.set('port', NodePort);

app.use(expressLogger(logger));
app.use(cors({origin: true}));

const initApplication = () => {
    app.listen(app.get('port'), () => {
        console.log(`Application is listening on PORT ${app.get('port')}`)
    });
};

const mainController = container.get<interfaces.IController>(TYPES.ContentController);

if (BaseUri) {
    app.use(BaseUri, mainController.application);
} else {
    app.use(mainController.application);
}

// Just a status endpoint
app.get('/status', (request:express.Request, response:express.Response) => {
    response.send('OK');
});

const ioHalter = container.get<IOHalter>(TYPES.IOHalter);

Promise.all(ioHalter.getAllPromises())
    .then(initApplication)
    .catch(e => console.log('Something went wrong while starting up the application', e));




