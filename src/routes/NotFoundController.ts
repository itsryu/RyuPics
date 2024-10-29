import { NextFunction, Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { Logger } from '../utils';

class NotFoundController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (_: Request, res: Response): void => {
        try {
            return res.status(404).render('404');
        } catch (err) {
            Logger.error((err as Error).message, NotFoundController.name);
            Logger.warn((err as Error).stack as string, NotFoundController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }

    };
}

export { NotFoundController };