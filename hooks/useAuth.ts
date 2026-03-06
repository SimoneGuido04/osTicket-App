import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
    baseUrl: string | null;
    apiKey: string | null;
    sessionToken: string | null;
    user: any | null;
    isBiometricEnabled: boolean;
    isLoading: boolean;

    initialize: () => Promise<void>;
    setSetupData: (url: string, key: string) => Promise<void>;
    login: (token: string, userData: any) => Promise<void>;
    logout: () => Promise<void>;
    enableBiometrics: () => Promise<boolean>;
    authenticateWithBiometrics: () => Promise<boolean>;
}

export const useAuth = create<AuthState>((set, get) => ({
    baseUrl: null,
    apiKey: null,
    sessionToken: null,
    user: null,
    isBiometricEnabled: false,
    isLoading: true,

    initialize: async () => {
        try {
            const url = await SecureStore.getItemAsync('osTicketUrl');
            const key = await SecureStore.getItemAsync('osTicketApiKey');
            const token = await SecureStore.getItemAsync('sessionToken');
            const userStr = await SecureStore.getItemAsync('user');
            const biometricStr = await SecureStore.getItemAsync('isBiometricEnabled');

            set({
                baseUrl: url,
                apiKey: key,
                sessionToken: token,
                user: userStr ? JSON.parse(userStr) : null,
                isBiometricEnabled: biometricStr === 'true',
                isLoading: false,
            });
        } catch (e) {
            console.error('Failed to load auth state', e);
            set({ isLoading: false });
        }
    },

    setSetupData: async (url: string, key: string) => {
        await SecureStore.setItemAsync('osTicketUrl', url);
        await SecureStore.setItemAsync('osTicketApiKey', key);
        set({ baseUrl: url, apiKey: key });
    },

    login: async (token: string, userData: any) => {
        await SecureStore.setItemAsync('sessionToken', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        set({ sessionToken: token, user: userData });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('sessionToken');
        await SecureStore.deleteItemAsync('user');
        // Keeping baseUrl and isBiometricEnabled for convenience
        set({ sessionToken: null, user: null });
    },

    enableBiometrics: async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
            await SecureStore.setItemAsync('isBiometricEnabled', 'true');
            set({ isBiometricEnabled: true });
            return true;
        }
        return false;
    },

    authenticateWithBiometrics: async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login to osTicket',
                fallbackLabel: 'Use Passcode',
            });
            return result.success;
        } catch (e) {
            return false;
        }
    },
}));
