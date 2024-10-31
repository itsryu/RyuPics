import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { Logger } from '../utils';

class HomeController extends RouteStructure {
    run = (_: Request, res: Response): void => {
        try {
            return void res.status(200).render('home');
        } catch (err) {
            Logger.error((err as Error).message, HomeController.name);
            Logger.warn((err as Error).stack as string, HomeController.name);

            return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };