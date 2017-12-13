import * as express from 'express';

export interface IController {
    application: express.Application;
}

export interface IDocument {
    params: any;
    content: any;
}

export interface IRequestFormat {
    device: string;
    origin: string;
    connection: string;
}

export interface IStorageObject extends IRequestFormat {
    content: any;
}