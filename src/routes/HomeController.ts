import { Request, Response } from 'express';
import { RyuPics } from '../server';
import { RouteStructure } from '../structs/RouteStructure';

class HomeController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        res.render('home');
    };
}

export { HomeController };