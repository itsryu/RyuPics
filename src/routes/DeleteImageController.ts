import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

class DeleteImageController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            const imageId = req.params.id;
            const imageDir = join(__dirname, '../../../', 'public', '.temp');
            const imageFile = readdirSync(imageDir).find(file => file === imageId + '.png');

            if (!imageFile) return res.status(404).json({ code: '404', message: 'Not Found' });

            const filePath = join(imageDir, imageFile);

            unlinkSync(filePath);

            this.client.logger.success(`${filePath} deleted successfully.`, DeleteImageController.name);

            res.status(200).json({ code: '200', message: 'OK' });
        } catch (error) {
            this.client.logger.error(error as string, DeleteImageController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { DeleteImageController };