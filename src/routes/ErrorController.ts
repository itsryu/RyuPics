import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../structs/RouteStructure';

class ErrorController {
    static notFound(req: Request, res: Response, next: NextFunction) {
        next(new HttpError(404, 'Rota não encontrada'));
    }
}

export { ErrorController };