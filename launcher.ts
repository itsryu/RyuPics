import { RyuPics } from './src/server';

const client = new RyuPics(process.env.STATE);

console.clear();

(async() => await client.listen())();