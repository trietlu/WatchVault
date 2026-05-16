type EnvSource = NodeJS.ProcessEnv;

const requireEnv = (source: EnvSource, name: string): string => {
    const value = source[name];
    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
};

const optionalEnv = (source: EnvSource, name: string): string | undefined => {
    const value = source[name]?.trim();
    return value ? value : undefined;
};

const parsePort = (value: string): number => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`Invalid PORT value: ${value}`);
    }

    return parsed;
};

const chainDefaults = {
    preview: {
        name: 'base-sepolia',
        rpcUrl: 'https://sepolia.base.org',
        chainId: 84532,
    },
    production: {
        name: 'base-mainnet',
        rpcUrl: 'https://mainnet.base.org',
        chainId: 8453,
    },
} as const;

const resolveChainEnvironment = (source: EnvSource): keyof typeof chainDefaults => {
    const configured = source.CHAIN_ENV ?? source.VERCEL_ENV;

    if (configured === 'production') {
        return 'production';
    }

    return 'preview';
};

export const readEnv = (source: EnvSource) => {
    const blockchainEnabled = source.BLOCKCHAIN_ENABLED === 'true';
    const chainEnvironment = resolveChainEnvironment(source);
    const defaultChain = chainDefaults[chainEnvironment];

    const resolved = {
        host: source.HOST ?? '0.0.0.0',
        port: parsePort(source.PORT ?? '3001'),
        jwtSecret: requireEnv(source, 'JWT_SECRET'),
        apiBaseUrl: source.API_BASE_URL ?? 'http://localhost:3001',
        appBaseUrl: source.APP_BASE_URL ?? 'http://localhost:3000',
        clerkSecretKey: optionalEnv(source, 'CLERK_SECRET_KEY'),
        uploadsDir: source.UPLOADS_DIR ?? 'uploads',
        blockchainEnabled,
        chainEnvironment,
        chainNetworkName: defaultChain.name,
        chainRpcUrl: optionalEnv(source, 'CHAIN_RPC_URL') ?? defaultChain.rpcUrl,
        chainPrivateKey: optionalEnv(source, 'CHAIN_PRIVATE_KEY'),
        chainContractAddress: optionalEnv(source, 'CHAIN_CONTRACT_ADDRESS'),
        chainId: source.CHAIN_ID ? Number(source.CHAIN_ID) : defaultChain.chainId,
        blobReadWriteToken: optionalEnv(source, 'BLOB_READ_WRITE_TOKEN'),
    };

    if (resolved.blockchainEnabled) {
        requireEnv(source, 'CHAIN_PRIVATE_KEY');
        requireEnv(source, 'CHAIN_CONTRACT_ADDRESS');

        if (!resolved.chainId || !Number.isInteger(resolved.chainId)) {
            throw new Error('CHAIN_ID is required when blockchain is enabled');
        }

        if (resolved.chainEnvironment === 'production' && resolved.chainId !== chainDefaults.production.chainId) {
            throw new Error('Production blockchain must use Base Mainnet CHAIN_ID=8453');
        }

        if (resolved.chainEnvironment === 'preview' && resolved.chainId !== chainDefaults.preview.chainId) {
            throw new Error('Preview blockchain must use Base Sepolia CHAIN_ID=84532');
        }
    }

    return resolved;
};

export const env = readEnv(process.env);
