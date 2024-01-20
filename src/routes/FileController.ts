import { promisify } from 'util';
import { Request, Response } from 'express';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

const existsAsync = promisify(require('fs').exists);
const writeFileAsync = promisify(require('fs').writeFile);

class FileController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const database = this.client.database.db('data');
        const collection = database.collection('files');

        try {
            const fileName = req.params.id;
            const file = await collection.findOne({ name: fileName });

            if (!file) return res.status(404).render('404');

            const buffer = Buffer.from(file.data, 'base64');
            const tempPath = join(__dirname, '../../../', 'public', '.temp');
            const filePath = join(tempPath, fileName);

            if (!(await existsAsync(tempPath))) await mkdir(tempPath, { recursive: true });

            await writeFileAsync(filePath, buffer);

            const fileURL = (this.client.state === 'development')
                ? `${process.env.LOCAL_URL}:${process.env.PORT}/.temp/${fileName}`
                : `${process.env.DOMAIN_URL}/.temp/${fileName}`;

            const uploads = await collection.countDocuments();

            res.locals.cacheControl = 'public, max-age=31536000';
            res.locals.expires = new Date(Date.now() + 31536000000).toUTCString();

            res.status(200).render('file', { title: fileName, file: fileURL, uploads, date: Date.now(), type: fileName.split('.')[1] });
        } catch (err) {
            this.client.logger.error((err as Error).message, FileController.name);
            this.client.logger.warn((err as Error).stack as string, FileController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { FileController };
