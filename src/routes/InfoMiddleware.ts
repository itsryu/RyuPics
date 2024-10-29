import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { Logger } from '../utils';

class InfoMiddleware extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, _: Response, next: NextFunction): void => {
        const ip = req.headers['x-forwarded-for'];

        if (ip) Logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip}`, InfoMiddleware.name);

        return void next();
    };
}

export { InfoMiddleware };