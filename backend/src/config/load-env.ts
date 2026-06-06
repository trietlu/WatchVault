import fs from 'fs';
import path from 'path';
import { parse } from 'dotenv';

const loadEnvFile = (filename: string, override: boolean) => {
    const envPath = path.resolve(process.cwd(), filename);

    if (!fs.existsSync(envPath)) {
        return;
    }

    const parsed = parse(fs.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
        if (!value.trim()) {
            continue;
        }

        if (override || process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
};

loadEnvFile('.env', false);
loadEnvFile('.env.local', true);
