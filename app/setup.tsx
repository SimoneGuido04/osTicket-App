import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function SetupScreen() {
    const [url, setUrlInput] = useState('');
    const [apiKey, setApiKey] = useState('');
    const { setSetupData } = useAuth();
    const router = useRouter();

    const handleSetup = async () => {
        if (!url || !apiKey) {
            Alert.alert('Error', 'Please enter both the osTicket URL and your API Key.');
            return;
        }

        // Simple validation
        let validUrl = url;
        if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
            validUrl = 'https://' + validUrl;
        }
        if (validUrl.endsWith('/')) {
            validUrl = validUrl.slice(0, -1);
        }

        try {
            await setSetupData(validUrl, apiKey);
            // Wait a tick for state to update, then navigate to login
            setTimeout(() => router.replace('/login'), 100);
        } catch (e) {
            Alert.alert('Error', 'Failed to save settings.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <View className="flex-row items-center p-4 pb-2 justify-between">
                        <View className="flex-1" />
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold flex-1 text-center">osTicket Setup</Text>
                        <View className="flex-1" />
                    </View>

                    <View className="px-6 mt-10">
                        <Text className="text-slate-900 dark:text-slate-100 text-[28px] font-bold text-center pb-2 pt-8">
                            Server Configuration
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-400 text-base text-center pb-6">
                            Connect to your osTicket installation
                        </Text>
                    </View>

                    <View className="flex-col gap-4 px-6 py-3 max-w-[480px] mx-auto w-full">
                        <View className="flex-col w-full">
                            <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2">osTicket URL</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="w-full rounded-xl text-slate-900 dark:text-slate-100 border border-primary/20 bg-white dark:bg-slate-800/50 focus:border-primary h-14 p-[15px] pl-12 text-base"
                                    placeholder="https://support.yourdomain.com"
                                    placeholderTextColor="#94a3b8"
                                    value={url}
                                    onChangeText={setUrlInput}
                                    autoCapitalize="none"
                                    keyboardType="url"
                                />
                                <View className="absolute left-4">
                                    <MaterialIcons name="link" size={20} color="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        <View className="flex-col w-full mt-2">
                            <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2">API Key</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="w-full rounded-xl text-slate-900 dark:text-slate-100 border border-primary/20 bg-white dark:bg-slate-800/50 focus:border-primary h-14 p-[15px] pl-12 text-base"
                                    placeholder="Your BMSVieira API Key"
                                    placeholderTextColor="#94a3b8"
                                    value={apiKey}
                                    onChangeText={setApiKey}
                                    autoCapitalize="none"
                                />
                                <View className="absolute left-4">
                                    <MaterialIcons name="vpn-key" size={20} color="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="mt-4 w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2"
                            onPress={handleSetup}
                        >
                            <Text className="text-white font-bold text-lg">Connect</Text>
                            <MaterialIcons name="arrow-forward" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
