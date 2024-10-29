import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { Logger } from '../utils';

class InfoMiddleware extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.headers['x-forwarded-for'];

        const origin = (req.headers.origin == 'http://localhost:8080') ? 'http://localhost:8080' : 'https://pics.ryuzaki.cloud'
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
        res.setHeader('Access-Control-Allow-Credentials', 'true')

        if (ip) Logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip}`, InfoMiddleware.name);

        return void next();
    };
}

export { InfoMiddleware };