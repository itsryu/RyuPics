import { promisify } from 'util';
import { Request, Response } from 'express';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
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

            if (file) {
                const buffer = Buffer.from(file.data, 'base64');
                const tempPath = join(__dirname, '../../../', 'public', '.temp');
                const filePath = join(tempPath, fileName);

                if (!(await existsAsync(tempPath))) await mkdir(tempPath, { recursive: true });

                await writeFileAsync(filePath, buffer);

                const fileURL = (this.client.state === 'development')
                    ? `${process.env.LOCAL_URL}:${process.env.PORT}/.temp/${fileName}`
                    : `${process.env.DOMAIN_URL}/.temp/${fileName}`;

                const uploads = await collection.countDocuments();
                const date = new Date(file.date).toISOString();

                res.locals.cacheControl = 'public, max-age=31536000';
                res.locals.expires = new Date(Date.now() + 31536000000).toUTCString();

                return res.status(200).render('file', { title: fileName, file: fileURL, uploads, date, type: fileName.split('.')[1] });
            } else {
                return res.status(404).render('404');
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, FileController.name);
            this.client.logger.warn((err as Error).stack as string, FileController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { FileController };
