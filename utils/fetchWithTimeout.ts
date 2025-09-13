// src/utils/fetchWithTimeout.ts

interface FetchWithTimeoutOptions extends RequestInit {
    timeout?: number;
}

/**
 * Fetch com suporte a timeout usando AbortController
 */
export async function fetchWithTimeout(
    url: string,
    options: FetchWithTimeoutOptions = {}
): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            throw {
                statusCode: 0,
                message: 'Timeout da requisição',
                error: 'TIMEOUT_ERROR'
            };
        }

        throw error;
    }
}