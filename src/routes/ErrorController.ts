import { Request, Response } from 'express';
import { HttpError } from '../structs/RouteStructure';

class ErrorController {
    static notFound(req: Request, res: Response) {
        res.send(new HttpError(404, 'Rota não encontrada'));
    }
}

export { ErrorController };