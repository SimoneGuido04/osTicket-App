import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_ENDPOINT = '/ost_wbs/index.php'; // BMSVieira API default path

// Create an Axios instance
const apiClient = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to automatically inject the base URL and API Key
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const url = await SecureStore.getItemAsync('osTicketUrl');
            const apiKey = await SecureStore.getItemAsync('osTicketApiKey');

            if (url) {
                // Ensure url doesn't end with a slash and combine with endpoint
                const cleanUrl = url.replace(/\/$/, '');
                config.baseURL = cleanUrl;
            }

            if (apiKey) {
                config.headers['apikey'] = apiKey; // as required by BMSVieira
            }

            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- BMSVieira API Request Wrapper ---

export interface ApiResponse<T> {
    status: 'Success' | 'Error';
    time?: number;
    data?: T;
    message?: string;
}

/**
 * Executes a POST request formatted for the BMSVieira API schema.
 * @param query The class name (e.g., 'ticket', 'user')
 * @param condition The method name (e.g., 'all', 'specific', 'add', 'reply')
 * @param sort Optional sorting or filtering command (e.g., 'status', 'id')
 * @param parameters Optional body payload/parameters
 */
export async function executeBMSRequest<T = any>(
    query: string,
    condition: string,
    sort?: string | null,
    parameters?: Record<string, any>
): Promise<T> {

    const payload = {
        query,
        condition,
        ...(sort && { sort }),
        ...(parameters && { parameters })
    };

    try {
        console.log(`[API Request] -> ${query}/${condition}`, payload);
        // BMSVieira API only accepts POST queries to its single entry point.
        // The structure itself defines whether it's checking data (GET equivalent) or adding data (POST/PUT equivalent).
        const response = await apiClient.post<ApiResponse<T>>(API_ENDPOINT, payload);

        // The API responds with status 'Success' or 'Error'
        if (response.data.status === 'Success') {
            if (response.data.data) {
                return response.data.data;
            }
            // If no data object but it's Success, just return an empty object or basic success
            return {} as T;
        } else {
            throw new Error(response.data.message || response.data.data?.toString() || 'Unknown API Error');
        }

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error(`[API Error] -> ${error.message}`, error.response?.data);
            throw new Error(error.response?.data?.message || 'Network error analyzing the request');
        }
        throw error;
    }
}

// --- Specific Service Methods ---

export const TicketService = {
    getAllTickets: async () => {
        // get all tickets, using 0 as "all records" as per the PHP schema
        return executeBMSRequest('ticket', 'all', 'status', { status: 0 });
    },

    getTicketById: async (id: string | number) => {
        return executeBMSRequest('ticket', 'specific', 'id', { id });
    },

    createTicket: async (payload: {
        user_id: number;
        title: string;
        subject: string;
        priority_id: number;
        status_id: number;
        dept_id: number;
        sla_id: number;
        topic_id: number;
    }) => {
        return executeBMSRequest('ticket', 'add', null, payload);
    },

    replyToTicket: async (payload: {
        ticket_id: string | number;
        body: string;
        staff_id: string | number;
    }) => {
        return executeBMSRequest('ticket', 'reply', null, payload);
    }
};

export const UserService = {
    // Can be used to list users or find specific user
    findUserByEmail: async (email: string) => {
        return executeBMSRequest('user', 'specific', 'email', { email });
    },

    getAllUsers: async () => {
        // creationDate with very old date to get all
        return executeBMSRequest('user', 'all', 'creationDate', {
            start_date: '2000-01-01',
            end_date: `2099-12-31`
        });
    }
};

export default apiClient;
