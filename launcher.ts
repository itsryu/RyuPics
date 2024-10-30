import { RyuPics } from './src/server';
import { config } from 'dotenv';

config({ path: './.env' });

const client = new RyuPics(process.env.STATE);

(async() => {
    console.clear();
    await client.listen();
})();