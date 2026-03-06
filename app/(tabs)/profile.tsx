import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useAuth } from '../../hooks/useAuth';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const { colorScheme, setColorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/login');
                }
            }
        ]);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 border-b border-primary/10">
                <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Profile & Settings</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
                {/* Profile Info */}
                <View className="p-6 items-center">
                    <View className="size-32 rounded-full border-4 border-primary/20 bg-primary/10 items-center justify-center mb-4">
                        <MaterialIcons name="person" size={64} color="#128c7e" />
                    </View>
                    <Text className="text-slate-900 dark:text-slate-100 text-2xl font-bold text-center">
                        {user?.username || 'John Doe'}
                    </Text>
                    <Text className="text-primary text-base font-medium text-center">
                        {user?.role || 'Support Agent'}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center">
                        Agent ID: #{user?.id || 'N/A'}
                    </Text>
                </View>

                {/* Preferences */}
                <View className="mt-2">
                    <Text className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider px-4 pb-2 pt-4 opacity-60">
                        Notification Preferences
                    </Text>

                    <View className="flex-row items-center px-4 py-3 border-b border-primary/5 bg-background-light dark:bg-background-dark justify-between">
                        <View className="flex-row items-center gap-4">
                            <View className="size-10 rounded-lg bg-primary/10 items-center justify-center">
                                <MaterialIcons name="notifications" size={20} color="#128c7e" />
                            </View>
                            <View>
                                <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Push Notifications</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Receive alerts on your device</Text>
                            </View>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={setPushEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#128c7e' }}
                        />
                    </View>

                    <View className="flex-row items-center px-4 py-3 border-b border-primary/5 bg-background-light dark:bg-background-dark justify-between">
                        <View className="flex-row items-center gap-4">
                            <View className="size-10 rounded-lg bg-primary/10 items-center justify-center">
                                <MaterialIcons name="mail" size={20} color="#128c7e" />
                            </View>
                            <View>
                                <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Email Notifications</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">New ticket & reply alerts</Text>
                            </View>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={setEmailEnabled}
                            trackColor={{ false: '#cbd5e1', true: '#128c7e' }}
                        />
                    </View>
                </View>

                {/* Personalization */}
                <View className="mt-4">
                    <Text className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-wider px-4 pb-2 pt-4 opacity-60">
                        Personalization
                    </Text>

                    <TouchableOpacity className="flex-row items-center px-4 py-3 border-b border-primary/5 bg-background-light dark:bg-background-dark justify-between">
                        <View className="flex-row items-center gap-4 flex-1">
                            <View className="size-10 rounded-lg bg-primary/10 items-center justify-center">
                                <MaterialIcons name="draw" size={20} color="#128c7e" />
                            </View>
                            <View>
                                <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Email Signature</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Manage your automated sign-off</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
                    </TouchableOpacity>

                    <View className="flex-row items-center px-4 py-3 border-b border-primary/5 bg-background-light dark:bg-background-dark justify-between">
                        <View className="flex-row items-center gap-4 flex-1">
                            <View className="size-10 rounded-lg bg-primary/10 items-center justify-center">
                                <MaterialIcons name="dark-mode" size={20} color="#128c7e" />
                            </View>
                            <View>
                                <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Dark Mode</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Switch theme mode</Text>
                            </View>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={(val) => setColorScheme(val ? 'dark' : 'light')}
                            trackColor={{ false: '#cbd5e1', true: '#128c7e' }}
                        />
                    </View>
                </View>

                {/* Logout */}
                <View className="mt-8 px-4">
                    <TouchableOpacity
                        className="w-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 py-4 rounded-xl flex-row items-center justify-center gap-2"
                        onPress={handleLogout}
                    >
                        <MaterialIcons name="logout" size={20} color="#ef4444" />
                        <Text className="text-red-600 dark:text-red-400 font-bold text-base">Logout from Agent Session</Text>
                    </TouchableOpacity>
                    <Text className="text-center text-slate-400 text-xs mt-6">osTicket Mobile v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
