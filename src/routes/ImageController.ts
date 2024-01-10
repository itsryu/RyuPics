import { Request, Response } from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
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
                const tempDir = join(__dirname, '../../../', 'public', 'temp');

                // Certifique-se de que o diretório temporário exista
                if (!existsSync(tempDir)) {
                    mkdirSync(tempDir);
                }

                const fileName = `${imageId}.png`;
                const filePath = join(tempDir, fileName);

                writeFileSync(filePath, buffer);

                const fileLink = process.env.STATE == 'development' ? `${process.env.LOCAL_URL}:${process.env.PORT}/temp/${fileName}` : `${process.env.DOMAIN_URL}/temp/${fileName}`;

                console.log('Arquivo temporário salvo em:', filePath);
                console.log('Link para o arquivo:', fileLink);

                res.render('index', { title: imageId, image: fileLink, uploads: collection.countDocuments(), date: new Date() });
            } else {
                return res.status(404).json({ code: '404', message: 'Image not found' });
            }
        } catch (err) {
            res.status(500).json({ code: '500', message: 'Incorrect imageId format' });
        }
    };
}

export { ImageController };