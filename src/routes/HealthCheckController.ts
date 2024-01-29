import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class HealthCheckController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            return res.status(200).json(new JSONResponse(200, 'OK').toJSON());
        } catch (err) {
            this.client.logger.error((err as Error).message, HealthCheckController.name);
            this.client.logger.warn((err as Error).stack as string, HealthCheckController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }

    };
}

export { HealthCheckController };