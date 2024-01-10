import express, { Express, Request, Response, NextFunction, Router } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { ErrorController, HomeController, ImageController, UploaderController } from './routes';
import { config } from 'dotenv';
import { Route } from './types/HTTPInterfaces';
import { Logger } from './utils/util';
import { join } from 'path';
config({ path: './.env' });

export class RyuPics {
    app: Express = express();
    storage: StorageEngine = multer.memoryStorage();
    upload: Multer = multer({ storage: this.storage });
    client: MongoClient;
    state!: string;
    logger: Logger = new Logger();

    constructor(state: string) {
        this.state = state;

        this.client = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.client.connect();
                req.dbClient = this.client;
                next();
            } catch (err) {
                this.logger.error('Failed to connect to MongoDB. Error: ' + err, 'MongoDB');
                res.status(500).send('Internal Server Error');
            }
        });

        this.config();

        process.on('uncaughtException', (err: Error) => this.logger.error(err.stack as string, 'uncaughtException'));
        process.on('unhandledRejection', (err) => this.logger.error(err as string, 'unhandledRejection'));
    }

    private config(): void {
        this.app.set('view engine', 'ejs');
        this.app.set('views', join(__dirname, '../../', 'views'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(this.initRoutes());
    }

    private initRoutes(): Router {
        const router = Router();
        const routes = this.loadRoutes();

        routes.forEach((route) => {
            const { method, path, handler } = route;

            switch (method) {
                case 'GET':
                    router.get(path, handler);
                    break;
                case 'POST':
                    router.post(path, this.upload.single('file'), handler);
                    break;
                default:
                    break;
            }
        });

        router.get('*', ErrorController.notFound);

        return router;
    }

    private loadRoutes(): Array<Route> {
        const routes: Array<Route> = [
            { method: 'GET', path: '/', handler: HomeController.index },
            { method: 'GET', path: '/image/:id', handler: ImageController.getImageDataById },
            { method: 'POST', path: '/upload', handler: UploaderController.handleUpload }
        ];

        return routes;
    }

    async databaseConnection() {
        try {
            await this.client.db('admin').command({ ping: 1 });
            this.logger.success('Pinged your deployment. Successfully connected to MongoDB!', 'MongoDB');
        } catch (err) {
            this.logger.error('Failed to connect to MongoDB. Please check your connection string. Error: ' + err, 'MongoDB');
        }
    }

    async start() {
        this.app.listen(process.env.PORT, () => {
            this.logger.success(`Server is running at ${this.state == 'development' ? `${process.env.LOCAL_URL}:${process.env.PORT}/` : `${process.env.DOMAIN_URL}`}`, 'Server');
        });

        await this.databaseConnection().catch(console.dir);
    }
}
