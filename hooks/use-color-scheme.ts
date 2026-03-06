import * as SecureStore from 'expo-secure-store';
import { useColorScheme as useNWColorScheme } from 'nativewind';
import { useEffect } from 'react';

export function useColorScheme() {
    const { colorScheme, setColorScheme: setNWColorScheme, toggleColorScheme } = useNWColorScheme();

    useEffect(() => {
        const loadPersistedTheme = async () => {
            try {
                const theme = await SecureStore.getItemAsync('theme');
                if (theme === 'light' || theme === 'dark') {
                    if (theme !== colorScheme) {
                        setNWColorScheme(theme);
                    }
                }
            } catch (e) {
                console.error('Failed to load persisted theme', e);
            }
        };
        loadPersistedTheme();
    }, []);

    const setColorScheme = async (theme: 'light' | 'dark') => {
        try {
            setNWColorScheme(theme);
            await SecureStore.setItemAsync('theme', theme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    return {
        colorScheme: colorScheme ?? 'light',
        setColorScheme,
        toggleColorScheme,
    };
}
