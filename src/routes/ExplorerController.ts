import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class ExplorerController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        if (req.method === 'GET') {
            return res.status(200).render('form');
        } else if (req.method === 'POST') {
            const { apiKey } = req.body;

            if (apiKey === process.env.AUTH_KEY) {
                return res.status(200).render('explorer', { apiKey });
            } else {
                return res.status(401).send(`
                    <script>
                        alert("Invalid Authorization Key!");
                        window.location.href = '/explorer';
                    </script>
                `);
            }
        };
    };
}

export { ExplorerController };