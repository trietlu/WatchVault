import 'dotenv/config';

import { defineConfig } from 'prisma/config';

const datasourceUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!datasourceUrl) {
    throw new Error('Prisma requires DIRECT_URL or DATABASE_URL to be set.');
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: datasourceUrl,
    },
});
