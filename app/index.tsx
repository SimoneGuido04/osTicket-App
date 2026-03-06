import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
    const { baseUrl, apiKey, sessionToken, isLoading, initialize, isBiometricEnabled, authenticateWithBiometrics } = useAuth();
    const router = useRouter();

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (isLoading) return;

        const navigate = async () => {
            if (!baseUrl || !apiKey) {
                router.replace('/setup');
            } else if (!sessionToken) {
                router.replace('/login');
            } else {
                if (isBiometricEnabled) {
                    const success = await authenticateWithBiometrics();
                    if (success) {
                        router.replace('/(tabs)/dashboard');
                    } else {
                        // Failed biometrics, go to login to force manual entry
                        router.replace('/login');
                    }
                } else {
                    router.replace('/(tabs)/dashboard');
                }
            }
        };

        navigate();
    }, [isLoading, baseUrl, apiKey, sessionToken, isBiometricEnabled, router, authenticateWithBiometrics]);

    return (
        <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
            <ActivityIndicator size="large" color="#128c7e" />
        </View>
    );
}
