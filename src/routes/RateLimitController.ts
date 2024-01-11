import { NextFunction, Request, Response } from 'express';
import { RouteStructure } from '../structs/RouteStructure';
import { RyuPics } from '../server';

const limit = 2;
let count = 0;
let lastUploadTimestamp = Date.now();

class RateLimitController extends RouteStructure {
    constructor(client: RyuPics) {
        super(client);
    }

    run = (req: Request, res: Response, next: NextFunction) => {
        const currentTimestamp = Date.now();

        if (currentTimestamp - lastUploadTimestamp < 1000) {
            if (count >= limit) {
                return res.status(429).json({ error: 'Too Many Requests' });
            }
            count++;
        } else {
            count = 1;
            lastUploadTimestamp = currentTimestamp;
        }

        next();
    };
}

export { RateLimitController };