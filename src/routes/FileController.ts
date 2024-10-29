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

                res.setHeader('Content-Type', mimeType);
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.setHeader('theme-color', '#000000');
                res.setHeader('og-site_name', 'RyuPics');
                res.setHeader('og-url', 'https://pics.ryuzaki.cloud/');
                res.setHeader('og-title', 'Ryu Gostoso');
                res.setHeader('og-updated_time', file.uploadDate.toISOString());
                res.setHeader('pubdate', file.uploadDate.toISOString());

                if (fileType && ['webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'ogg'].includes(fileType)) {
                    res.setHeader('og-type', 'video');
                    res.setHeader('og-video', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('og-video-secure_url', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('og-video-type', `video/${fileType}`);
                    res.setHeader('twitter-card', 'player');
                    res.setHeader('twitter-player', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                } else {
                    res.setHeader('og-type', 'website');
                    res.setHeader('og-image', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('twitter-card', 'summary_large_image');
                    res.setHeader('twitter-image', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                }

                res.setHeader('twitter-domain', 'https://pics.ryuzaki.cloud/');
                res.setHeader('twitter-url', 'https://pics.ryuzaki.cloud/');
                res.setHeader('twitter-title', 'Ryu Gostoso');

                readStream.pipe(res);

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
