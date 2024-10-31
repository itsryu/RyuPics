import { Request, Response } from 'express';
import { RouteStructure } from '../structs/routeStructure';
class ExplorerController extends RouteStructure {
    run = (req: Request, res: Response): void => {
        if (req.method === 'GET') {
            return void res.status(200).render('form');
        } else if (req.method === 'POST') {
            const { apiKey } = req.body;

            if (apiKey === process.env.AUTH_KEY) {
                return void res.status(200).render('explorer', { apiKey });
            } else {
                return void res.status(401).send(`
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