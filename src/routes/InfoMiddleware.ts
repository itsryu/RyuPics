import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class InfoMiddleware extends RouteStructure{
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const ip = req.headers['x-forwarded-for'];

        if (ip) this.client.logger.info(`\nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip}`, InfoMiddleware.name);
        
        return next();
    };
}

export { InfoMiddleware };