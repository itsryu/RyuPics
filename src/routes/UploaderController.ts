import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

class UploaderController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = async (req: Request, res: Response) => {
        const database = this.client.database.db('data');
        const collection = database.collection('images');

        const discordString = '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| ‌‌';

        try {
            const data = req.file?.buffer.toString('base64');

            if (data) {
                const imageBuffer: Buffer = Buffer.from(data, 'base64');
                const fileSize: number = imageBuffer.length;

                await collection.insertOne({
                    name: req.file?.originalname,
                    size: fileSize,
                    contentType: req.file?.mimetype,
                    data: req.file?.buffer.toString('base64')
                })
                    .then(() => this.client.logger.success(`Successfully uploaded ${req.file?.originalname} to the database.`, UploaderController.name))
                    .catch((err) => this.client.logger.error(`Failed to upload ${req.file?.originalname} to the database. Error: ${err}`, UploaderController.name));

                const URL = (this.client.state == 'development')
                    ? `${discordString}${process.env.LOCAL_URL}:${process.env.PORT}/image/${req.file?.originalname}`
                    : `${discordString}${process.env.DOMAIN_URL}/image/${req.file?.originalname}`;

                return res.status(200).send(URL);
            } else {
                return res.status(400).json({ code: '400', message: 'Bad Request - Missing Data' });
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, UploaderController.name);
            this.client.logger.warn((err as Error).stack as string, UploaderController.name);

            return res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { UploaderController };