import axios from 'axios';
import { appConfig } from './config';

type TokenResolver = () => Promise<string | null>;

let tokenResolver: TokenResolver | null = null;

export const setAuthTokenResolver = (resolver: TokenResolver | null) => {
    tokenResolver = resolver;
};

const api = axios.create({
    baseURL: appConfig.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    if (config.headers.Authorization) {
        return config;
    }

    const authToken = tokenResolver
        ? await tokenResolver()
        : localStorage.getItem('token');

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
});

export default api;
