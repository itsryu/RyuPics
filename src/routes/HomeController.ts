import { Request, Response } from 'express';

class HomeController {
    static index(req: Request, res: Response) {
        res.send('Welcome!');
    }
}

export { HomeController };