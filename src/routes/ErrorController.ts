import { Request, Response } from 'express';
import { HttpError, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class ErrorController extends RouteStructure{
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        res.send(new HttpError(404, 'Rota não encontrada'));
    };
}

export { ErrorController };