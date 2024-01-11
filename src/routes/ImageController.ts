import { promisify } from 'util';
import { Request, Response } from 'express';
import { mkdir } from 'fs/promises';
import { ObjectId } from 'mongodb';
import { join } from 'path';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

const existsAsync = promisify(require('fs').exists);
const writeFileAsync = promisify(require('fs').writeFile);

class ImageController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const { dbClient } = req;
        const database = dbClient.db('imagensDB');
        const collection = database.collection('imagens');

        try {
            const imageId = req.params.id;
            const image = await collection.findOne({ _id: new ObjectId(imageId) });

            if (!image) return res.status(404).render('404');

            const buffer = Buffer.from(image.data, 'base64');
            const imageDir = join(__dirname, '../../../', 'public', '.temp');
            const fileName = `${imageId}.png`;
            const filePath = join(imageDir, fileName);

            if (!(await existsAsync(imageDir))) await mkdir(imageDir, { recursive: true });

            await writeFileAsync(filePath, buffer);

            const fileLink = (this.client.state === 'development')
                ? `${process.env.LOCAL_URL}:${process.env.PORT}/.temp/${fileName}`
                : `${process.env.DOMAIN_URL}/.temp/${fileName}`;

            const uploads = await collection.countDocuments();

            res.locals.cacheControl = 'public, max-age=31536000';
            res.locals.expires = new Date(Date.now() + 31536000000).toUTCString();

            return res.status(200).render('image', { title: imageId, image: fileLink, uploads, date: new Date().toDateString() });
        } catch (err) {
            this.client.logger.error((err as Error).message, ImageController.name);
            this.client.logger.warn((err as Error).stack as string, ImageController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { ImageController };
