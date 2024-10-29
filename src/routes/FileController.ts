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
                res.setHeader('X-Theme-Color', '#000000');
                res.setHeader('X-OG-Site-Name', 'RyuPics');
                res.setHeader('X-OG-URL', 'https://pics.ryuzaki.cloud/');
                res.setHeader('X-OG-Title', 'Ryu Gostoso');
                res.setHeader('X-OG-Updated-Time', file.uploadDate.toISOString());
                res.setHeader('X-Pubdate', file.uploadDate.toISOString());

                if (fileType && ['webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'ogg'].includes(fileType)) {
                    res.setHeader('X-OG-Type', 'video');
                    res.setHeader('X-OG-Video', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('X-OG-Video-Secure-URL', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('X-OG-Video-Type', `video/${fileType}`);
                    res.setHeader('X-Twitter-Card', 'player');
                    res.setHeader('X-Twitter-Player', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                } else {
                    res.setHeader('X-OG-Type', 'website');
                    res.setHeader('X-OG-Image', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                    res.setHeader('X-Twitter-Card', 'summary_large_image');
                    res.setHeader('X-Twitter-Image', `https://pics.ryuzaki.cloud/files/${file.filename}`);
                }

                res.setHeader('X-Twitter-Domain', 'https://pics.ryuzaki.cloud/');
                res.setHeader('X-Twitter-URL', 'https://pics.ryuzaki.cloud/');
                res.setHeader('X-Twitter-Title', 'Ryu Gostoso');

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
