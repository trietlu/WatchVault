import axios from 'axios';

export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError<{ error?: string }>(error)) {
        return error.response?.data?.error ?? fallback;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};
