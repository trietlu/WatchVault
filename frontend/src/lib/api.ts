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
    const token = localStorage.getItem('token');
    const authToken = token ?? (tokenResolver ? await tokenResolver() : null);

    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
});

export default api;
