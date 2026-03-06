import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserService } from '../services/api';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, enableBiometrics } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            // Check if user exists using the BMSVieira API
            const result: any = await UserService.findUserByEmail(email);

            if (!result || !result.users || result.users.length === 0) {
                Alert.alert('Login Failed', 'No account found with this email address.');
                setLoading(false);
                return;
            }

            const userData = result.users[0];
            const sessionToken = `session_${userData.user_id}_${Date.now()}`;

            await login(sessionToken, {
                id: userData.user_id,
                username: userData.name,
                email: email,
                role: 'Agent'
            });

            // Ask for biometrics if available
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                Alert.alert(
                    'Enable Biometrics',
                    'Would you like to use Face ID / Fingerprint for future logins?',
                    [
                        { text: 'No', style: 'cancel', onPress: () => router.replace('/(tabs)/dashboard') },
                        {
                            text: 'Yes',
                            onPress: async () => {
                                await enableBiometrics();
                                router.replace('/(tabs)/dashboard');
                            }
                        }
                    ]
                );
            } else {
                router.replace('/(tabs)/dashboard');
            }

        } catch (e) {
            Alert.alert('Login Failed', 'Invalid credentials or server error.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

                    {/* Header */}
                    <View className="flex-row items-center p-4 pb-2 justify-between">
                        <TouchableOpacity onPress={() => router.back()} className="w-12 items-start justify-center">
                            <MaterialIcons name="arrow-back" size={24} color="#64748b" />
                        </TouchableOpacity>
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold flex-1 text-center pr-12">osTicket</Text>
                    </View>

                    {/* Hero Section */}
                    <View className="flex-row justify-center mt-6">
                        <View className="w-full max-w-sm aspect-video items-center justify-center">
                            <MaterialIcons name="support-agent" size={100} color="#128c7e" />
                        </View>
                    </View>

                    {/* Welcome Text */}
                    <View className="px-6">
                        <Text className="text-slate-900 dark:text-slate-100 text-[28px] font-bold text-center pb-2 pt-8">
                            Welcome Back
                        </Text>
                        <Text className="text-slate-600 dark:text-slate-400 text-base text-center pb-6">
                            Log in to your help desk account to continue
                        </Text>
                    </View>

                    {/* Login Form */}
                    <View className="flex-col gap-4 px-6 py-3 max-w-[480px] mx-auto w-full">
                        <View className="bg-primary/10 border border-primary/20 p-4 rounded-xl mb-4">
                            <Text className="text-primary text-sm leading-relaxed">
                                Note: Direct password verification is not supported by the current API. Please enter your registered osTicket email to link this device.
                            </Text>
                        </View>

                        <View className="flex-col w-full">
                            <Text className="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2">Email Address</Text>
                            <View className="relative justify-center">
                                <TextInput
                                    className="w-full rounded-xl text-slate-900 dark:text-slate-100 border border-primary/20 bg-white dark:bg-slate-800/50 focus:border-primary h-14 p-[15px] pl-12 text-base"
                                    placeholder="agent@yourdomain.com"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <View className="absolute left-4">
                                    <MaterialIcons name="email" size={20} color="#94a3b8" />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="mt-4 w-full h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2"
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text className="text-white font-bold text-lg">
                                {loading ? 'Logging in...' : 'Secure Login'}
                            </Text>
                            {!loading && <MaterialIcons name="login" size={20} color="white" />}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className="flex-row items-center px-6 py-6 max-w-[480px] mx-auto w-full">
                        <View className="flex-1 border-t border-primary/10" />
                        <Text className="px-4 text-slate-400 text-sm font-medium">OR CONTINUE WITH</Text>
                        <View className="flex-1 border-t border-primary/10" />
                    </View>

                    {/* SSO Options */}
                    <View className="flex-col gap-3 px-6 pb-12 max-w-[480px] mx-auto w-full">
                        <TouchableOpacity className="flex-row items-center justify-center gap-3 w-full h-12 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                            <MaterialIcons name="hub" size={20} color="#128c7e" />
                            <Text className="text-slate-700 dark:text-slate-200 font-semibold">SSO (OAuth / LDAP)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="flex-row items-center justify-center gap-3 w-full h-12 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                            <FontAwesome5 name="google" size={18} color="#4285F4" />
                            <Text className="text-slate-700 dark:text-slate-200 font-semibold">Google Workspace</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="mt-auto p-6 items-center">
                        <Text className="text-slate-400 text-xs text-center">
                            Powered by osTicket © 2025{'\n'}All rights reserved.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
