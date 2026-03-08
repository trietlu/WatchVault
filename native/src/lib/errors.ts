import axios from 'axios';

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.error;
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }

    if (!error.response) {
      const baseUrl =
        typeof error.config?.baseURL === 'string'
          ? error.config.baseURL
          : 'the API server';
      if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        return `Cannot reach ${baseUrl}. On a physical device, localhost points to the phone. Set EXPO_PUBLIC_API_BASE_URL to your computer's LAN IP and make sure backend runs on port 3001.`;
      }

      return `Cannot reach ${baseUrl}. Make sure the backend is running and reachable from this device.`;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
