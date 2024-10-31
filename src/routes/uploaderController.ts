import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/routeStructure';
import { Readable } from 'stream';
import { Logger } from '../utils';

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

class UploaderController extends RouteStructure {
    run = async (req: Request, res: Response): Promise<void> => {
        const allowedExt = [...imageExtensions, ...videoExtensions];
        const name = req.file?.originalname;

        console.log(req.file);

        if (!req.file || !name) {
            return void res.status(400).json(new JSONResponse(res.statusCode, 'Bad Request - Missing File').toJSON());
        }

        const fileExtension = name.split('.').pop()?.toLowerCase();

        if (!fileExtension || !allowedExt.includes(fileExtension)) {
            return void res.status(400).json(new JSONResponse(res.statusCode, 'Bad Request - Invalid File Type').toJSON());
        }

        try {
            const existingFiles = await this.client.bucket.find({ filename: name }).toArray();

            if (existingFiles.length > 0) {
                return void res.status(400).json(new JSONResponse(res.statusCode, 'Bad Request - File Already Exists').toJSON());
            }

            const readableFileStream = Readable.from(req.file.buffer);
            const uploadStream = this.client.bucket.openUploadStream(name, {
                contentType: req.file.mimetype,
            });

            readableFileStream.pipe(uploadStream)
                .on('error', (error) => {
                    Logger.error(`Upload failed: ${error.message}`, UploaderController.name);
                    res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
                })
                .on('finish', () => {
                    const fileId = uploadStream.id;
                    const str = '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| ‌‌';

                    const URL = this.client.state === 'development'
                        ? `${str}${process.env.LOCAL_URL}:${process.env.PORT}/file/${fileId}`
                        : `${str}${process.env.DOMAIN_URL}/file/${fileId}`;

                    Logger.success(`Successfully uploaded ${name} with ID: ${fileId}`, UploaderController.name);
                    return res.status(200).send(URL);
                });
        } catch (error) {
            Logger.error(`Failed to upload: ${(error as Error).message}`, UploaderController.name);
            res.status(500).json(new JSONResponse(res.statusCode, 'Internal Server Error').toJSON());
        }
    };
}

export { UploaderController };