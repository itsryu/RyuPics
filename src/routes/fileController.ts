import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { GridFSFile, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class FileController extends RouteStructure {
    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            let file: GridFSFile | undefined;

            if (ObjectId.isValid(id)) {
                file = (await this.client.bucket.find({ _id: new ObjectId(id) }).toArray())[0];
            } else {
                file = (await this.client.bucket.find({ filename: id }).toArray())[0];
            }

            if (file) {
                const fileName = file.filename;
                const fileType = fileName.split('.').pop();
                const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
                const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
                const mimeType = imageExtensions.includes(fileType!) ? `image/${fileType}` : videoExtensions.includes(fileType!) ? `video/${fileType}` : 'file';
                const uploads = (await this.client.bucket.find({}).toArray()).length;
                const fileUrl = process.env.STATE === 'development' ? `http://localhost:${process.env.PORT}/file-data?id=${file._id}` : `https://pics.ryuzaki.cloud/file-data?id=${file._id}`;

                return void res.status(200).render('file', {
                    file: fileUrl,
                    title: file.filename,
                    type: file.contentType ?? mimeType,
                    date: file.uploadDate,
                    uploads
                });
            } else {
                return void res.status(404).json(new JSONResponse(res.statusCode, 'Not Found').toJSON());
            }
        } catch (err) {
            Logger.error((err as Error).message, FileController.name);
            Logger.warn((err as Error).stack as string, FileController.name);

            return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }
    };
}

export { FileController };
