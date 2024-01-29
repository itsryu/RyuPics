import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
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
                return res.status(400).json(new JSONResponse(400,'Bad Request').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                this.client.logger.warn(`Invalid authorization key used: ${token}`, KeyController.name);
                return res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
            } else {
                this.client.logger.info(`Valid authorization key used: ${token}`, KeyController.name);
                return next();
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, KeyController.name);
            this.client.logger.warn((err as Error).stack as string, KeyController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { KeyController };