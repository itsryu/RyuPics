import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class KeyController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const userKey = req.headers['auth'];

        if (!userKey) return res.status(401).json({ error: 'Chave de autorização não fornecida.' });

        if (userKey && userKey === process.env.AUTH_KEY) {
            this.client.logger.info(`Valid authorization key used: ${userKey}`, KeyController.name);
            return next();
        } else {
            this.client.logger.warn(`Invalid authorization key used: ${userKey}`, KeyController.name);

            return res.status(401).json({ code: '401', error: 'Chave de autorização inválida.' }).render('404');
        }
    };
}

export { KeyController };