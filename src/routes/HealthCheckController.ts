import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class HealthCheckController extends RouteStructure{
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        res.status(200).json({ status: 'OK' });
    };
}

export { HealthCheckController };