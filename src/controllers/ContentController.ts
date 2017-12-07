import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';
import { IController } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';

@injectable()
export class ContentController implements IController {
    application: express.Application;

    constructor(@inject(TYPES.IOHalter) ioHalter:IOHalter) {
        this.application = express();

        this.application.post('/content', this.handleContentRequest);
    }

    handleContentRequest:express.RequestHandler = (req, res) => {
        res.send('OK bro!'));
    }
}