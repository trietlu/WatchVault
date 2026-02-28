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

export const readEnv = (source: EnvSource) => {
    const blockchainEnabled = source.BLOCKCHAIN_ENABLED === 'true';

    const resolved = {
        port: parsePort(source.PORT ?? '3001'),
        jwtSecret: requireEnv(source, 'JWT_SECRET'),
        apiBaseUrl: source.API_BASE_URL ?? 'http://localhost:3001',
        appBaseUrl: source.APP_BASE_URL ?? 'http://localhost:3000',
        uploadsDir: source.UPLOADS_DIR ?? 'uploads',
        blockchainEnabled,
        chainRpcUrl: optionalEnv(source, 'CHAIN_RPC_URL'),
        chainPrivateKey: optionalEnv(source, 'CHAIN_PRIVATE_KEY'),
        chainContractAddress: optionalEnv(source, 'CHAIN_CONTRACT_ADDRESS'),
    };

    if (resolved.blockchainEnabled) {
        requireEnv(source, 'CHAIN_RPC_URL');
        requireEnv(source, 'CHAIN_PRIVATE_KEY');
        requireEnv(source, 'CHAIN_CONTRACT_ADDRESS');
    }

    return resolved;
};

export const env = readEnv(process.env);
