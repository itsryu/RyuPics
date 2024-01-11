import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class KeyController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const ip = req.headers['x-forwarded-for'];
        const userKey = req.headers['auth'];

        if (userKey && userKey == process.env.AUTH_KEY) {
            return next();
        } else {
            this.client.logger.warn(`Invalid authorization key used: \nRoute: ${req.originalUrl}\nMethod: ${req.method}\nIP: ${ip}\nKey: ${userKey}`, KeyController.name);

            return res.status(401).json({ error: 'Chave de autorização inválida.' });
        }
    };
}

export { KeyController };