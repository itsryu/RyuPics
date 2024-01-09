import { Request, Response } from 'express';
import { readFileSync } from 'fs';
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

            if (!image) {
                return res.status(404).json({ code: '404', message: 'Image not found' });
            }

            const htmlTemplate = readFileSync(join(__dirname, '../../../', 'public', 'index.html'), 'utf-8');

            const html = htmlTemplate
                .replace('{{imageId}}', imageId)
                .replace('{{imageTitle}}', 'Título da Imagem')
                .replace('{{imageDescription}}', 'Descrição da Imagem')
                .replace('{{imageUrl}}', `${process.env.STATE == 'development' ? `${process.env.LOCAL_URL}:${process.env.PORT}/image/${imageId}` : `${process.env.DOMAIN_URL}/image/${imageId}`}`)
                .replace('{{imageContentType}}', image.contentType)
                .replace('{{imageData}}', image.data.toString('base64'));

            res.send(html);
        } catch (err) {
            res.status(500).json({ code: '500', message: 'Incorrect imageId format' });
        }
    };
}

export { ImageController };