import { Request, Response } from 'express';
import { JSONResponse, RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';
import { readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

class DeleteFileController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response) => {
        try {
            const fileName = req.params.id;
            const fileDir = join(__dirname, '../../../', 'public', '.temp');
            const file = readdirSync(fileDir).find(file => file === fileName);

            if (file) {
                const filePath = join(fileDir, file);

                unlinkSync(filePath);

                this.client.logger.success(`${filePath} deleted successfully.`, DeleteFileController.name);

                return res.status(200).json(new JSONResponse(200, 'OK').toJSON());
            } else {
                return res.status(404).json(new JSONResponse(404, 'Not Found').toJSON());
            }
        } catch (err) {
            this.client.logger.error((err as Error).message, DeleteFileController.name);
            this.client.logger.warn((err as Error).stack as string, DeleteFileController.name);

            return res.status(500).json(new JSONResponse(500, 'Internal Server Error').toJSON());
        }
    };
}

export { DeleteFileController };