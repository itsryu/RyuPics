import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class NotFoundController extends RouteStructure{
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        res.status(404).render('404');
    };
}

export { NotFoundController };