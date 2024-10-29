import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { GridFSBucket, GridFSFile, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class FileDataController extends RouteStructure {
    private bucket: GridFSBucket;

    constructor(client: RyuPics) {
        super(client);

        this.bucket = new GridFSBucket(client.database.db('data'), { bucketName: 'uploads' });
    }

    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.query.id;
            let file: GridFSFile | undefined;

            if (id && typeof (id) === 'string' && ObjectId.isValid(id)) {
                file = (await this.bucket.find({ _id: new ObjectId(id) }).toArray())[0];
            } else {
                file = (await this.bucket.find({ filename: id }).toArray())[0];
            }

            if (file) {
                const downloadStream = this.bucket.openDownloadStreamByName(file.filename);

                res.header('Content-Type', file.contentType);
                res.header('Content-Disposition', `inline; filename="${file.filename}"`);
                
                downloadStream.on('data', (chunk) => {
                    res.write(chunk);
                });

                downloadStream.on('error', () => {
                    res.status(500).send('Error downloading file');
                });

                downloadStream.on('end', () => {
                    res.end();
                });
            } else {
                return void res.status(404).json(new JSONResponse(404, 'Not Found').toJSON());
            }
        } catch (err) {
            Logger.error((err as Error).message, FileDataController.name);
            Logger.warn((err as Error).stack as string, FileDataController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { FileDataController };
