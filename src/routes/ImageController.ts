import { Request, Response } from 'express';
import { existsSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { ObjectId } from 'mongodb';
import { join } from 'path';

class ImageController {
    static getImageDataById = async (
        req: Request,
        res: Response
    ) => {
        const { dbClient } = req;
        const database = dbClient.db('imagensDB');
        const collection = database.collection('imagens');

        try {
            const imageId = req.params.id;
            const image = await collection.findOne({ _id: new ObjectId(imageId) });

            if (image) {
                const buffer = Buffer.from(image.data, 'base64');
                const tempDir = join(__dirname, '../../../', 'public', '.temp');
                const fileName = `${imageId}.png`;
                const filePath = join(tempDir, fileName);

                if (!existsSync(tempDir)) {
                    await mkdir(tempDir, { recursive: true });
                }

                writeFileSync(filePath, buffer);

                const fileLink = (process.env.STATE === 'development')
                    ? `${process.env.LOCAL_URL}:${process.env.PORT}/.temp/${fileName}`
                    : `${process.env.DOMAIN_URL}/.temp/${fileName}`;

                const uploads = await collection.countDocuments();

                return res.render('index', { title: imageId, image: fileLink, uploads, date: new Date() });
            } else {
                return res.status(404).json({ code: '404', message: 'Image not found' });
            }
        } catch (error) {
            console.error('Error processing image request:', error);
            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { ImageController };