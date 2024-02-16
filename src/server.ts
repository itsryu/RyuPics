import express, { Express, Router } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { MongoClient, ServerApiVersion } from 'mongodb';
import { FilesController, HealthCheckController, HomeController, ExplorerController, FileController, UploaderController, KeyController, InfoMiddleware, DeleteFileController, NotFoundController, ShortenerController } from './routes';
import { config } from 'dotenv';
import { Route } from './types/HTTPInterfaces';
import { Logger, Util } from './utils/util';
import { join } from 'node:path';
import cors from 'cors';
import { json } from 'body-parser';
config({ path: './.env' });

export class RyuPics {
    public readonly app: Express = express();
    public readonly logger: Logger = new Logger();
    public readonly utils: Util = new Util();
    public readonly storage: StorageEngine = multer.memoryStorage();
    public readonly multer: Multer = multer({ storage: this.storage });
    public readonly database: MongoClient;
    public state!: string;

    public constructor(state: string) {
        this.state = state;

        this.database = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true
            }
        });

        this.config();

        process.on('uncaughtException', (err: Error) => this.logger.error(err.stack as string, 'uncaughtException'));
        process.on('unhandledRejection', (err) => this.logger.error(err as string, 'unhandledRejection'));
    }

    private config(): void {
        this.app.use(cors());
        this.app.use(json());
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
            const infoMiddleware = new InfoMiddleware(this).run;

            switch (method) {
                case 'GET':
                    router.get(path, infoMiddleware, handler.run);
                    break;
                case 'POST':
                    const upload = path.includes('/upload');
                    const shorten = path.includes('/shorten');
                    const explorer = path.includes('/explorer');

                    router.post(path, infoMiddleware, ...(upload || shorten ? [new KeyController(this).run, this.multer.single('file')] : []), handler.run);
                    if (!upload && explorer) router.all(path, infoMiddleware, handler.run);
                    break;
                default:
                    break;
            }
        });

        router.get('*', new NotFoundController(this).run);

        return router;
    }

    private loadRoutes(): Array<Route> {
        const routes: Array<Route> = [
            { method: 'GET', path: '/', handler: new HomeController(this) },
            { method: 'GET', path: '/health', handler: new HealthCheckController(this) },
            { method: 'GET', path: '/:id', handler: new FileController(this)},
            { method: 'GET', path: '/file/:id', handler: new FileController(this) },
            { method: 'GET', path: '/files', handler: new FilesController(this) },
            { method: 'POST', path: '/explorer', handler: new ExplorerController(this) },
            { method: 'POST', path: '/delete/:id', handler: new DeleteFileController(this) },
            { method: 'POST', path: '/upload', handler: new UploaderController(this) },
            { method: 'POST', path: '/shorten', handler: new ShortenerController(this) }
        ];

        return routes;
    }

    private async databaseConnection() {
        this.database.connect()
            .then(() => this.logger.success('Connected to MongoDB!', 'MongoDB'))
            .catch((err) => this.logger.error('Failed to connect to MongoDB. Please check your connection string. Error: ' + err, 'MongoDB'));

        try {
            await this.database.db('admin').command({ ping: 1 });

            this.logger.success('Pinged your deployment. Successfully connected to MongoDB!', 'MongoDB');
        } catch (err) {
            this.logger.error('Failed to ping your deployment. Please check your connection string. Error: ' + err, 'MongoDB');
        }
    }

    public async listen() {
        this.app.listen(process.env.PORT, () => {
            this.logger.success(`Server is running at ${this.state == 'development' ? `${process.env.LOCAL_URL}:${process.env.PORT}/` : `${process.env.DOMAIN_URL}`}`, 'Server');
        });

        await this.databaseConnection().catch(console.dir);
    }
}
