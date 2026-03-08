import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, env.host, () => {
    console.log(`Server is running on ${env.host}:${env.port}`);
});
