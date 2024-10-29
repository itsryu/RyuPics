import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class ShortenerController extends RouteStructure {
    private bucket: GridFSBucket;

    constructor(client: RyuPics) {
        super(client);

        this.bucket = new GridFSBucket(client.database.db('data'), { bucketName: 'uploads' });
    }

    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const { url } = req.body;
            const parts = url.split('/');
            const id = parts[parts.length - 1] as number;
            const file = (await this.bucket.find({ _id: new ObjectId(id) }).toArray())[0];
            
            const URL = (this.client.state == 'development')
                ? `${process.env.LOCAL_URL}:${process.env.PORT}/${file._id}`
                : `${process.env.DOMAIN_URL}/${file._id}`;

            return void res.status(200).send(URL);
        } catch (err) {
            Logger.error((err as Error).message, ShortenerController.name);
            Logger.warn((err as Error).stack as string, ShortenerController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { ShortenerController };