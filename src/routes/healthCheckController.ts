import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { Logger } from '../utils';

class HealthCheckController extends RouteStructure {
    run = (_: Request, res: Response): void => {
        try {
            return void res.status(200).json(new JSONResponse(200, 'OK').toJSON());
        } catch (err) {
            Logger.error((err as Error).message, HealthCheckController.name);
            Logger.warn((err as Error).stack as string, HealthCheckController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HealthCheckController };