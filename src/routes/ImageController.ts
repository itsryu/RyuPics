import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

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
                res.setHeader('Content-Type', image.contentType);

                res.send(buffer);

                res.render('index', { pageTitle: imageId, ogData: {
                    image:`data:${image.contentType};base64,${buffer.toString('base64')}`
                }});
            } else {
                return res.status(404).json({ code: '404', message: 'Image not found' });
            }
        } catch (err) {
            res.status(500).json({ code: '500', message: 'Incorrect imageId format' });
        }
    };
}

export { ImageController };