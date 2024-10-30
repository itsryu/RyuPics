import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { GridFSFile, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class ShortenerController extends RouteStructure {
    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const { url } = req.body;
            const parts = url.split('/');
            const id = parts[parts.length - 1];
            
            let file: GridFSFile | undefined;

            if (ObjectId.isValid(id)) {
                file = (await this.client.bucket.find({ _id: new ObjectId(id) }).toArray())[0];
            } else {
                file = (await this.client.bucket.find({ filename: id }).toArray())[0];
            }

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