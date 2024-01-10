import { Request, Response } from 'express';

class UploaderController {
    static handleUpload = async (
        req: Request,
        res: Response
    ) => {
        const { dbClient } = req;
        const database = dbClient.db('imagensDB');
        const collection = database.collection('imagens');

        const unicodeString = '\u200C\u200D\u200C\u200B\u200D\u200D\u200C\u200B\u200B\u200B\u200C\u200B\u200C\u200C\u200B\u200B\u200C\u200D\u200D\u200B\u200B\u200B\u200C\u200C\u200C\u200C\u200C\u200C\u200B\u200B\u200C\u200C\u200C\u200D\u200C\u200C\u200B\u200C\u200C\u200C\u200C\u200C\u200D\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200B\u200B\u200B\u200D\u200C\u200B\u200B\u200B\u200C\u200B\u200C\u200D\u200B\u200D\u200D\u200D\u200C\u200C\u200B\u200C\u200C\u200D\u200C\u200C\u200C\u200C\u200C\u200D\u200C\u200D\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200B\u200B\u200B\u200B\u200D\u200C\u200C\u200D\u200B\u200C\u200C\u200B\u200B\u200B\u200B\u200D\u200D\u200C\u200C\u200D\u200C\u200C\u200B\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200D\u200C\u200C\u200D\u200C\u200C\u200D\u200C\u200C\u200B\u200C\u200C\u200C\u200D\u200C\u200C\u200C\u200D\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C\u200C';
        const discordString = '||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| ‌‌';
        try {
            const result = await collection.insertOne({
                data: req.file?.buffer.toString('base64'),
                contentType: req.file?.mimetype
            });

            res.send(process.env.STATE == 'development' ? `${discordString}${process.env.LOCAL_URL}:${process.env.PORT}/image/${result.insertedId}?${unicodeString}` : `${discordString}${process.env.DOMAIN_URL}/image/${result.insertedId}?${unicodeString}`);
        } catch (err) {
            res.status(500).send('Internal Server Error');
        }
    };
}

export { UploaderController };