import { RyuPics } from './src/server';

const client = new RyuPics(process.env.STATE);

(async() => await client.start())();