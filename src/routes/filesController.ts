import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { Logger } from '../utils';

interface Image {
    chunkSize: number;
    contentType: string;
    length: number;
    uploadDate: Date;
    name: string;
    url: string;
    _id: string;
}

class FilesController extends RouteStructure {
    run = async (req: Request, res: Response): Promise<void> => {
        const auth = req.headers['authorization'];
        const [bearer, token] = auth?.length ? (auth.split(' ')) : ['Bearer', ''];
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 20;
        const skip = (page - 1) * pageSize;

        try {
            if (bearer !== 'Bearer' || !token) {
                return void res.status(400).json(new JSONResponse(res.statusCode, 'Bad Request - Missing Token').toJSON());
            } else if (token !== process.env.AUTH_KEY) {
                return void res.status(401).json(new JSONResponse(res.statusCode, 'Unauthorized').toJSON());
            } else {
                const files = await this.client.bucket.find().skip(skip).limit(pageSize).toArray();
                const images: Image[] = [];

                for (const file of files) {
                    const fileName = file.filename;
                    const fileType = fileName.split('.').pop();
                    const mimeType = `image/${fileType}`;

                    await new Promise<void>((resolve, reject) => {
                        images.push({
                            _id: file._id.toHexString(),
                            chunkSize: file.chunkSize,
                            contentType: file.contentType ?? mimeType,
                            length: file.length,
                            uploadDate: file.uploadDate,
                            name: file.filename,
                            url: `/file-data?id=${file._id.toHexString()}`
                        });

                        resolve();
                    });
                }

                return void res.status(200).json(new JSONResponse(res.statusCode, 'OK', images).toJSON());
            }
        } catch (err) {
            Logger.error((err as Error).message, FilesController.name);
            Logger.warn((err as Error).stack as string, FilesController.name);

            return void res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }
    };
}

export { FilesController };
