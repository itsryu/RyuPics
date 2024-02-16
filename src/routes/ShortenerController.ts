import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { FileDocument } from '../types/MongoInterfaces';


class ShortenerController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const database = this.client.database.db('data');
        const collection = database.collection<FileDocument>('files');

        try {
            const { url } = req.body;
            const parts = url.split('/');
            const name = parts[parts.length - 1];
            const id = (await collection.findOne({ name }))?.id;

            const URL = (this.client.state == 'development')
                ? `${process.env.LOCAL_URL}:${process.env.PORT}/${id}`
                : `${process.env.DOMAIN_URL}/${id}`;

            res.status(200).send(URL);
        } catch (err) {
            this.client.logger.error((err as Error).message, ShortenerController.name);
            this.client.logger.warn((err as Error).stack as string, ShortenerController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { ShortenerController };