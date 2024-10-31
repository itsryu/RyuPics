import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { GridFSFile, ObjectId } from 'mongodb';
import { Logger } from '../utils';

class DeleteFileController extends RouteStructure {
    run = async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;

            if (id) {
                let file: GridFSFile | undefined;

                if (ObjectId.isValid(id)) {
                    file = (await this.client.bucket.find({ _id: new ObjectId(id) }).toArray())[0];
                } else {
                    file = (await this.client.bucket.find({ filename: id }).toArray())[0];
                }

                if (file) {
                    try {
                        await this.client.bucket.delete(file._id);

                        Logger.info(`Deleted file: ${file.filename} (${file._id})`, DeleteFileController.name);
                        return void res.status(200).json(new JSONResponse(res.statusCode, 'OK').toJSON());
                    } catch (err) {
                        Logger.error((err as Error).message, DeleteFileController.name);
                        Logger.warn((err as Error).stack as string, DeleteFileController.name);
                        return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
                    }
                } else {
                    return void res.status(404).json(new JSONResponse(res.statusCode, 'Not Found').toJSON());
                }
            } else {
                return void res.status(400).json(new JSONResponse(res.statusCode, 'Bad Request: Missing file identifier').toJSON());
            }
        } catch (err) {
            Logger.error((err as Error).message, DeleteFileController.name);
            Logger.warn((err as Error).stack as string, DeleteFileController.name);

            return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }
    };
}

export { DeleteFileController };