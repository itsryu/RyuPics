import { Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { readdirSync, unlinkSync } from 'fs';
import { join } from 'path';

class DeleteFileController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            const imageId = req.params.id;
            const fileDir = join(__dirname, '../../../', 'public', '.temp');
            const file = readdirSync(fileDir).find(file => file === imageId + '.png');

            if (!file) return res.status(404).json({ code: '404', message: 'Not Found' });

            const filePath = join(fileDir, file);

            unlinkSync(filePath);

            this.client.logger.success(`${filePath} deleted successfully.`, DeleteFileController.name);

            res.status(200).json({ code: '200', message: 'OK' });
        } catch (error) {
            this.client.logger.error(error as string, DeleteFileController.name);

            res.status(500).json({ code: '500', message: 'Internal Server Error' });
        }
    };
}

export { DeleteFileController };