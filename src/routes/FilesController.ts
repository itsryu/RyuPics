import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class FilesController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const database = this.client.database.db('data');
        const collection = await database.collection('files').find({}).toArray();
        const auth = req.headers['authorization'];
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];

        try {
            if (bearer !== 'Bearer' || !token) {
                return res.status(400).json({ code: '400', message: 'Bad Request - Missing Token' });
            } else if (token !== process.env.AUTH_KEY) {
                return res.status(401).json({ code: '401', message: 'Unauthorized' });
            } else {
                return res.status(200).json({ code: '200', message: 'OK', data: collection });
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, FilesController.name);
            this.client.logger.warn((err as Error).stack as string, FilesController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { FilesController };
