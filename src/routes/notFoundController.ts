import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { Logger } from '../utils';

class NotFoundController extends RouteStructure {
    run = (_: Request, res: Response): void => {
        try {
            return res.status(404).render('404');
        } catch (err) {
            Logger.error((err as Error).message, NotFoundController.name);
            Logger.warn((err as Error).stack as string, NotFoundController.name);

            return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }

    };
}

export { NotFoundController };