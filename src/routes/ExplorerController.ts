import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class ExplorerController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        if (req.method === 'GET') {
            res.status(200).render('form');
        } else if (req.method === 'POST') {
            const { apiKey } = req.body;
            
            if (apiKey === process.env.AUTH_KEY) {
                res.status(200).render('explorer');
            } else {
                res.status(401).json({ code: '401', error: 'Chave de autorização inválida.' });
            }
        };
    };
}

export { ExplorerController };