import { Request, Response } from 'express';
import { RyuPics } from '../server';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';

class HomeController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            return res.status(200).render('home');
        } catch (err) {
            this.client.logger.error((err as Error).message, HomeController.name);
            this.client.logger.warn((err as Error).stack as string, HomeController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { HomeController };