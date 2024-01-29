import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
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
                return res.status(400).json(new JSONResponse(400, 'Bad Request - Missing Token').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                return res.status(401).json(new JSONResponse(401, 'Unauthorized').toJSON());
            } else {
                return res.status(200).json(new JSONResponse(200, 'OK', collection).toJSON());
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, FilesController.name);
            this.client.logger.warn((err as Error).stack as string, FilesController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { FilesController };
