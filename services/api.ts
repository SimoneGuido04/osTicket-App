import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// BMSVieira API entry point — just the filename, since the base URL
// saved in SecureStore already includes the /ost_wbs/ path.
export const API_ENDPOINT = '/index.php';

// Create an Axios instance
const apiClient = axios.create({
    timeout: 15000,
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
                // Strip trailing slashes
                let cleanUrl = url.replace(/\/+$/, '');

                // Ensure the URL always includes the /ost_wbs path
                // This handles both cases:
                //   - User enters: https://domain.com          → https://domain.com/ost_wbs
                //   - User enters: https://domain.com/ost_wbs  → https://domain.com/ost_wbs
                //   - User enters: https://domain.com/ost_wbs/ → https://domain.com/ost_wbs
                if (!cleanUrl.endsWith('/ost_wbs')) {
                    cleanUrl += '/ost_wbs';
                }

                config.baseURL = cleanUrl;
            }

            if (apiKey) {
                config.headers['apikey'] = apiKey; // as required by BMSVieira
            }

            console.log(`[API Full URL] -> ${config.baseURL}${config.url}`);

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
 * All calls go to a single entry point (index.php) via POST.
 * The PHP backend reads:
 *   - query      → PHP class name (Ticket, User, Department, Task, Sla)
 *   - condition  → PHP method name (all, specific, add, reply, close)
 *   - sort       → optional sort/filter key (status, email, creationDate, id)
 *   - parameters → optional payload with the actual data
 *
 * @param query      The class name (e.g., 'ticket', 'user', 'department')
 * @param condition  The method name (e.g., 'all', 'specific', 'add', 'reply', 'close')
 * @param sort       Optional sorting or filtering key
 * @param parameters Optional body payload
 */
export async function executeBMSRequest<T = any>(
    query: string,
    condition: string,
    sort?: string | null,
    parameters?: Record<string, any>
): Promise<T> {

    const payload: Record<string, any> = {
        query,
        condition,
    };

    // 'sort' goes at the top level of the body (same level as query/condition)
    if (sort) {
        payload.sort = sort;
    }

    // 'parameters' is a nested object inside the body
    if (parameters && Object.keys(parameters).length > 0) {
        payload.parameters = parameters;
    }

    try {
        console.log(`[API Request] -> POST ${query}/${condition}`, JSON.stringify(payload));

        const response = await apiClient.post<ApiResponse<T>>(API_ENDPOINT, payload);

        // The API responds with status 'Success' or 'Error'
        if (response.data.status === 'Success') {
            if (response.data.data !== undefined && response.data.data !== null) {
                const returnData = response.data.data as any;
                // BMSVieira API's ticket/all returns an array of arrays (grouped by ticket). 
                // We normalize it here so the UI gets a flat array of ticket objects.
                if (returnData && returnData.tickets && Array.isArray(returnData.tickets)) {
                    returnData.tickets = returnData.tickets.map((t: any) => Array.isArray(t) ? t[0] : t);
                }
                return returnData as T;
            }
            return {} as T;
        } else {
            // Error responses can have message in 'message' or 'data'
            const errorMsg = response.data.message
                || (typeof response.data.data === 'string' ? response.data.data : null)
                || 'Unknown API Error';
            throw new Error(errorMsg);
        }

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            // More descriptive error messages based on the type of failure
            let userMessage = 'Network error';

            if (error.code === 'ECONNABORTED') {
                userMessage = 'Request timed out — the server took too long to respond.';
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                userMessage = 'Cannot reach the server. Check your connection and server URL.';
            } else if (error.response) {
                // Server responded with an error status code
                const status = error.response.status;
                if (status === 401 || status === 403) {
                    userMessage = 'Authentication failed — check your API Key.';
                } else if (status === 404) {
                    userMessage = 'API endpoint not found — check the server URL.';
                } else if (status >= 500) {
                    userMessage = `Server error (${status}). Please try again later.`;
                } else {
                    userMessage = error.response.data?.message || `Request failed (HTTP ${status}).`;
                }
            }

            console.error(`[API Error] -> ${error.message}`, {
                url: error.config?.baseURL,
                endpoint: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
            });

            throw new Error(userMessage);
        }
        throw error;
    }
}

// ============================================================================
//  TICKET SERVICE
//  Docs: https://bmsvieira.gitbook.io/osticket-api/ticket
// ============================================================================

export const TicketService = {

    /**
     * Get all tickets (status 0 = all regardless of state)
     * Docs: ticket → all → sort: status → parameters.status: 0
     */
    getAllTickets: async () => {
        return executeBMSRequest('ticket', 'all', 'status', { status: 0 });
    },

    /**
     * Get tickets filtered by status code
     * 0=All, 1=Open, 2=Resolved, 3=Closed, 4=Archived, 5=Deleted, 6=On Going, 7=Pending
     */
    getTicketsByStatus: async (status: number) => {
        return executeBMSRequest('ticket', 'all', 'status', { status });
    },

    /**
     * Get a specific ticket by its numeric ID
     * Docs: ticket → specific → parameters.id
     */
    getTicketById: async (id: string | number) => {
        return executeBMSRequest('ticket', 'specific', null, { id: Number(id) });
    },

    /**
     * Get tickets by creation date range
     * Docs: ticket → all → sort: creationDate → parameters.start_date, end_date
     */
    getTicketsByCreationDate: async (startDate: string, endDate: string) => {
        return executeBMSRequest('ticket', 'all', 'creationDate', {
            start_date: startDate,
            end_date: endDate,
        });
    },

    /**
     * Get tickets by creation date and status
     * Docs: ticket → all → sort: creationDateByStatus
     */
    getTicketsByCreationDateAndStatus: async (startDate: string, endDate: string, status: number) => {
        return executeBMSRequest('ticket', 'all', 'creationDateByStatus', {
            start_date: startDate,
            end_date: endDate,
            status,
        });
    },

    /**
     * Create a new ticket
     * Docs: ticket → add
     */
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

    /**
     * Reply to a ticket
     * Docs: ticket → reply
     */
    replyToTicket: async (payload: {
        ticket_id: number | string;
        body: string;
        staff_id?: number | string;
        user_id?: number | string;
    }) => {
        return executeBMSRequest('ticket', 'reply', null, payload);
    },

    closeTicket: async (payload: {
        ticket_id: number;
        body: string;
        staff_id: number;
        status_id: number;
        team_id: number;
        dept_id: number;
        topic_id: number;
        username: string;
    }) => {
        return executeBMSRequest('ticket', 'close', null, payload);
    },

    /**
     * Add an internal note to a ticket
     */
    addInternalNote: async (payload: {
        ticket_id: number | string;
        body: string;
        staff_id: number | string;
    }) => {
        return executeBMSRequest('ticket', 'note', null, payload);
    },
};

// ============================================================================
//  USER SERVICE
//  Docs: https://bmsvieira.gitbook.io/osticket-api/users
// ============================================================================

export const UserService = {

    /**
     * Find a user by email
     * Docs: user → specific → sort: email → parameters.email
     */
    findUserByEmail: async (email: string) => {
        return executeBMSRequest('user', 'specific', 'email', { email });
    },

    /**
     * Find a staff member by email (Custom)
     */
    findStaffByEmail: async (email: string) => {
        return executeBMSRequest('user', 'specific', 'staff_email', { email });
    },

    /**
     * Find a user by their numeric ID
     * Docs: user → specific → sort: id → parameters.id
     */
    getUserById: async (id: number | string) => {
        return executeBMSRequest('user', 'specific', 'id', { id: Number(id) });
    },

    /**
     * Get all users by creation date range
     * Docs: user → all → sort: creationDate → parameters.start_date, end_date
     */
    getAllUsers: async () => {
        return executeBMSRequest('user', 'all', 'creationDate', {
            start_date: '2000-01-01 00:00:00',
            end_date: '2099-12-31 23:59:59',
        });
    },

    /**
     * Add a new user
     * Docs: user → add
     */
    addUser: async (payload: { name: string; email: string }) => {
        return executeBMSRequest('user', 'add', null, payload);
    },

    /**
     * Search users by name or email
     */
    searchUsers: async (query: string) => {
        return executeBMSRequest('user', 'all', 'search', { q: query });
    },
};

// ============================================================================
//  DEPARTMENT SERVICE
//  Docs: https://bmsvieira.gitbook.io/osticket-api/departments
// ============================================================================

export const DepartmentService = {

    /**
     * Get a specific department by ID
     */
    getDepartmentById: async (id: number) => {
        return executeBMSRequest('department', 'specific', null, { id });
    },

    /**
     * Get departments by name
     */
    getDepartmentByName: async (name: string) => {
        return executeBMSRequest('department', 'specific', 'name', { name });
    },

    /**
     * Get all departments by creation date
     */
    getAllDepartments: async () => {
        return executeBMSRequest('department', 'all', 'creationDate', {
            start_date: '2000-01-01 00:00:00',
            end_date: '2099-12-31 23:59:59',
        });
    },

    /**
     * Add a new department
     */
    addDepartment: async (payload: { name: string }) => {
        return executeBMSRequest('department', 'add', null, payload);
    },
};

// ============================================================================
//  TASK SERVICE
//  Docs: https://bmsvieira.gitbook.io/osticket-api/tasks
// ============================================================================

export const TaskService = {

    /**
     * Get a specific task by ID
     */
    getTaskById: async (id: number) => {
        return executeBMSRequest('task', 'specific', null, { id });
    },

    /**
     * Get tasks by creation date range
     */
    getTasksByCreationDate: async (startDate: string, endDate: string) => {
        return executeBMSRequest('task', 'all', 'creationDate', {
            start_date: startDate,
            end_date: endDate,
        });
    },

    /**
     * Get tasks by ticket ID
     */
    getTasksByTicket: async (ticketId: number) => {
        return executeBMSRequest('task', 'specific', 'ticket', { ticket_id: ticketId });
    },
};

// ============================================================================
//  SLA SERVICE
//  Docs: https://bmsvieira.gitbook.io/osticket-api/sla
// ============================================================================

export const SlaService = {

    /**
     * Get a specific SLA by ID
     */
    getSlaById: async (id: number) => {
        return executeBMSRequest('sla', 'specific', null, { id });
    },

    /**
     * Get all SLAs by creation date
     */
    getAllSlas: async () => {
        return executeBMSRequest('sla', 'all', 'creationDate', {
            start_date: '2000-01-01 00:00:00',
            end_date: '2099-12-31 23:59:59',
        });
    },

    /**
     * Add a new SLA
     */
    addSla: async (payload: { name: string; grace_period: number; notes: string }) => {
        return executeBMSRequest('sla', 'add', null, payload);
    },

    /**
     * Delete an SLA
     */
    deleteSla: async (id: number) => {
        return executeBMSRequest('sla', 'delete', null, { id });
    },
};

// ============================================================================
//  PRIORITY SERVICE
// ============================================================================

export const PriorityService = {
    getAllPriorities: async () => {
        return executeBMSRequest('priority', 'all');
    },
};

// ============================================================================
//  TOPIC SERVICE
// ============================================================================

export const TopicService = {
    getAllTopics: async () => {
        return executeBMSRequest('topics', 'all');
    },
};

export default apiClient;
