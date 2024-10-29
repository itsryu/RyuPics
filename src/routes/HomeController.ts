import { Request, Response } from 'express';
import { RyuPics } from '../server';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { Logger } from '../utils';

class HomeController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (_: Request, res: Response): void => {
        try {
            return void res.status(200).render('home');
        } catch (err) {
            Logger.error((err as Error).message, HomeController.name);
            Logger.warn((err as Error).stack as string, HomeController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };