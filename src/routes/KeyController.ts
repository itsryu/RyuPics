import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class KeyController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const auth = req.headers['authorization'];
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];

        try {
            if (bearer !== 'Bearer' || !token) {
                return res.status(400).json({ code: '400', message: 'Bad Request' });
            } else if (token !== process.env.AUTH_KEY) {
                this.client.logger.warn(`Invalid authorization key used: ${token}`, KeyController.name);
                return res.status(401).json({ code: '401', message: 'Unauthorized' });
            } else {
                this.client.logger.info(`Valid authorization key used: ${token}`, KeyController.name);
                return next();
            }
        } catch (error) {
            this.client.logger.error(error as string, KeyController.name);
            return res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { KeyController };