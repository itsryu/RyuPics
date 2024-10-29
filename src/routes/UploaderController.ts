import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import { Logger } from '../utils';

class UploaderController extends RouteStructure {
    private bucket: GridFSBucket;

    constructor(client: RyuPics) {
        super(client);

        const database = this.client.database.db('data');
        this.bucket = new GridFSBucket(database, { bucketName: 'uploads' });
    }

    run = async (req: Request, res: Response): Promise<void> => {
        const allowedExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'ogg'];
        const name = req.file?.originalname;

        if (!req.file || !name) {
            return void res.status(400).json(new JSONResponse(400, 'Bad Request - Missing File').toJSON());
        }

        const fileExtension = name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedExt.includes(fileExtension)) {
            return void res.status(400).json(new JSONResponse(400, 'Bad Request - Invalid File Type').toJSON());
        }

        try {
            const existingFiles = await this.bucket.find({ filename: name }).toArray();
            if (existingFiles.length > 0) {
                return void res.status(400).json(new JSONResponse(400, 'Bad Request - File Already Exists').toJSON());
            }

            const readableFileStream = Readable.from(req.file.buffer);
            const uploadStream = this.bucket.openUploadStream(name, {
                contentType: req.file.mimetype,
            });

            readableFileStream.pipe(uploadStream)
                .on('error', (error) => {
                    Logger.error(`Upload failed: ${error.message}`, UploaderController.name);
                    res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
                })
                .on('finish', () => {
                    const fileId = uploadStream.id;
                    const URL = this.client.state === 'development'
                        ? `${process.env.LOCAL_URL}:${process.env.PORT}/file/${fileId}`
                        : `${process.env.DOMAIN_URL}/file/${fileId}`;

                    Logger.success(`Successfully uploaded ${name} with ID: ${fileId}`, UploaderController.name);
                    return res.status(200).send(URL);
                });

        } catch (error) {
            Logger.error(`Failed to upload: ${(error as Error).message}`, UploaderController.name);
            res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { UploaderController };