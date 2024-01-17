import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class ImagesController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const database = this.client.database.db('data');
        const collection = await database.collection('images').find({}).toArray();

        try {
            res.json(collection);
        } catch (err) {
            this.client.logger.error((err as Error).message, ImagesController.name);
            this.client.logger.warn((err as Error).stack as string, ImagesController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { ImagesController };
