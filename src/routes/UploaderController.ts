import { Request, Response } from 'express';

class UploaderController {
    static handleUpload = async (
        req: Request,
        res: Response
    ) => {
        const { dbClient } = req;
        const database = dbClient.db('imagensDB');
        const collection = database.collection('imagens');

        try {
            const result = await collection.insertOne({
                data: req.file?.buffer.toString('base64'),
                contentType: req.file?.mimetype
            });

            res.send(process.env.STATE == 'development' ? `${process.env.LOCAL_URL}:${process.env.PORT}/image/${result.insertedId}` : `${process.env.DOMAIN_URL}/image/${result.insertedId}`);
        } catch (err) {
            res.status(500).send('Internal Server Error');
        }
    };
}

export { UploaderController };