import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class NotFoundController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            return res.status(404).render('404');
        } catch (err) {
            this.client.logger.error((err as Error).message, NotFoundController.name);
            this.client.logger.warn((err as Error).stack as string, NotFoundController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }

    };
}

export { NotFoundController };