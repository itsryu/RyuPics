import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { Logger } from '../utils';

class KeyController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction): void => {
        const auth = req.headers['authorization'];
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];

        try {
            if (bearer !== 'Bearer' || !token) {
                return void res.status(400).json(new JSONResponse(400,'Bad Request').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                Logger.warn(`Invalid authorization key used: ${token}`, KeyController.name);
                return void res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
            } else {
                Logger.info(`Valid authorization key used: ${'*'.repeat(token.length)}`, KeyController.name);
                return void next();
            }
        } catch (err) {
            Logger.error((err as Error).message, KeyController.name);
            Logger.warn((err as Error).stack as string, KeyController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { KeyController };