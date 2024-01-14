import express, { Express, Request, Response, NextFunction, Router } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { ErrorController, HealthCheckController, HomeController, ImageController, UploaderController, KeyController, InfoMiddleware, DeleteImageController } from './routes';
import { config } from 'dotenv';
import { Route } from './types/HTTPInterfaces';
import { Logger } from './utils/util';
import { join } from 'path';
import cors from 'cors';
config({ path: './.env' });

export class RyuPics {
    app: Express = express();
    logger: Logger = new Logger();
    storage: StorageEngine = multer.memoryStorage();
    multer: Multer = multer({ storage: this.storage });
    database: MongoClient;
    state!: string;

    constructor(state: string) {
        this.state = state;

        this.database = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        this.app.use(async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.database.connect();
                req.dbClient = this.database;
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
        this.app.use(cors());
        this.app.set('view engine', 'ejs');
        this.app.set('views', join(__dirname, '../../', 'views'));
        this.app.use(express.static(join(__dirname, '../../', 'public')));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(this.initRoutes());
    }

    private initRoutes(): Router {
        const router = Router();
        const routes = this.loadRoutes();

        routes.forEach((route) => {
            const { method, path, handler } = route;

            switch (method) {
                case 'GET': {
                    router.get(path, new InfoMiddleware(this).run, handler.run);
                    break;
                }
                case 'POST': {
                    if (path.includes('/upload')) {
                        router.post(path, new InfoMiddleware(this).run, new KeyController(this).run, this.multer.single('file'), handler.run);
                    } else {
                        router.post(path, new InfoMiddleware(this).run, handler.run);
                    }

                    break;
                }
                default: {
                    break;
                }
            }
        });

        router.get('*', new ErrorController(this).run);

        return router;
    }

    private loadRoutes(): Array<Route> {
        const routes: Array<Route> = [
            { method: 'GET', path: '/', handler: new HomeController(this) },
            { method: 'GET', path: '/health', handler: new HealthCheckController(this) },
            { method: 'GET', path: '/image/:id', handler: new ImageController(this) },
            { method: 'POST', path: '/delete/:id', handler: new DeleteImageController(this) },
            { method: 'POST', path: '/upload', handler: new UploaderController(this) }
        ];

        return routes;
    }

    async databaseConnection() {
        try {
            await this.database.db('admin').command({ ping: 1 });
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
