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
                const fileId = new ObjectId(id);
                file = (await this.client.bucket.find({ _id: fileId }).toArray())[0];
            } else {
                const fileName = id;
                file = (await this.client.bucket.find({ filename: fileName }).toArray())[0];
            }

            if (file) {
                const fileName = file.filename;
                const fileType = fileName.split('.').pop();
                const mimeType = `image/${fileType}`;
                const uploads = (await this.client.bucket.find({}).toArray()).length;

                return void res.status(200).render('file', {
                    file: process.env.STATE === 'development' ? `http://localhost:${process.env.PORT}/file-data?id=${file._id}` : `https://pics.ryuzaki.cloud/file-data?id=${file._id}`,
                    title: file.filename,
                    type: file.contentType ?? mimeType,
                    date: file.uploadDate,
                    uploads
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
