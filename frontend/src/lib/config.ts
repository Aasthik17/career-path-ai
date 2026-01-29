/**
 * CareerPath AI Configuration
 * LOCAL-ONLY MODE - No AWS deployment required
 */
export const config = {
    // API endpoint - uses Next.js local API routes
    apiEndpoint: '/api',

    // Local mode - no AWS needed
    isLocalMode: true,

    // Disabled AWS services for local dev
    cognito: {
        region: 'us-east-1',
        userPoolId: '',
        userPoolClientId: '',
    },

    s3: {
        region: 'us-east-1',
        resumeBucket: 'local',
    },

    // Feature flags - auth disabled for local
    features: {
        enableAuth: false,
        enableAnalytics: false,
    },
};

// API client helper
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${config.apiEndpoint}${endpoint}`;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Add auth token if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
        (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
