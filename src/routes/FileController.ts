import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { GridFSBucket, GridFSFile, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class FileController extends RouteStructure {
    private bucket: GridFSBucket;

    constructor(client: RyuPics) {
        super(client);

        this.bucket = new GridFSBucket(client.database.db('data'), { bucketName: 'uploads' });
    }

    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            let file: GridFSFile | undefined;

            if (ObjectId.isValid(id)) {
                const fileId = new ObjectId(id);
                file = (await this.bucket.find({ _id: fileId }).toArray())[0];
            } else {
                const fileName = id;
                file = (await this.bucket.find({ filename: fileName }).toArray())[0];
            }

            if (file) {
                const fileName = file.filename;
                const fileType = fileName.split('.').pop();
                const mimeType = `image/${fileType}`;
                const readStream = this.bucket.openDownloadStreamByName(fileName);
                const uploads =  this.bucket.find({});
                const chunks: Buffer[] = [];

                readStream.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                readStream.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64Image = buffer.toString('base64');
                    const fileUrl = `data:${mimeType};base64,${base64Image}`;

                    res.render('file', {
                        file: fileUrl,
                        title: file.filename,
                        type: file.contentType ?? mimeType,
                        date: file.uploadDate,
                        uploads
                    });
                });

                readStream.on('error', (err) => {
                    Logger.error((err as Error).message, FileController.name);
                    Logger.warn((err as Error).stack as string, FileController.name);

                    return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
                });
            } else {
                return void res.status(404).json(new JSONResponse(404, 'Not Found').toJSON());
            }
        } catch (err) {
            Logger.error((err as Error).message, FileController.name);
            Logger.warn((err as Error).stack as string, FileController.name);

            return void res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { FileController };
