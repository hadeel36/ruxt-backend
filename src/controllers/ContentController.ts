import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import { IController } from '../interfaces';
import { IOHalter } from '../utils/IOHalter';
import { BigQueryCalculatorService } from '../services/BigQueryCalculatorService';

@injectable()
export class ContentController implements IController {
    application: express.Application;
    bigQueryCalculatorService: BigQueryCalculatorService;

    constructor(@inject(TYPES.BigQueryCalculatorService) bigQueryCalculatorService:BigQueryCalculatorService) {
        this.bigQueryCalculatorService = bigQueryCalculatorService;

        this.application = express();

        this.application.post('/content', this.handleContentRequest);
    }

    handleContentRequest:express.RequestHandler = (req, res) => {
        res.send('OK bro!');
    }
}