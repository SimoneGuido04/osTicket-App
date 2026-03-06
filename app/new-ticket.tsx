import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TicketService, UserService } from '../services/api';

export default function NewTicketScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priorityText, setPriorityText] = useState('Normal');
    const [loading, setLoading] = useState(false);

    const handleCreateTicket = async () => {
        if (!email || !subject || !message) {
            Alert.alert('Error', 'Please fill in the user email, subject, and message.');
            return;
        }

        setLoading(true);

        try {
            // 1. Find User ID by Email
            const userResult: any = await UserService.findUserByEmail(email);
            if (!userResult || !userResult.users || userResult.users.length === 0) {
                Alert.alert('Error', 'No user found with that email address.');
                setLoading(false);
                return;
            }
            const userId = userResult.users[0].user_id;

            // 2. Map Priority
            const priorityMap: Record<string, number> = {
                'Low': 1,
                'Normal': 2,
                'High': 3,
                'Emergency': 4
            };
            const priorityId = priorityMap[priorityText] || 2;

            // 3. Create Ticket (using default department 1 and topic 1 for now)
            await TicketService.createTicket({
                user_id: userId,
                title: subject,
                subject: message, // the API expects the body in the 'subject' field for the thread entry
                priority_id: priorityId,
                status_id: 1, // Open
                dept_id: 1,
                sla_id: 1,
                topic_id: 1
            });

            Alert.alert('Success', 'Ticket created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Failed to create ticket', error);
            Alert.alert('Error', 'Failed to create the ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-primary/10">
                <TouchableOpacity
                    className="size-12 items-start justify-center"
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#128c7e" />
                </TouchableOpacity>
                <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight flex-1 text-center pr-12">
                    New Ticket
                </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>

                    {/* User / Requester */}
                    <View className="flex-col gap-2 py-3">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">User / Requester</Text>
                            <TouchableOpacity>
                                <Text className="text-primary text-sm font-semibold">Select from Directory</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="relative justify-center">
                            <TextInput
                                className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 text-slate-900 dark:text-slate-100 h-14 pl-12 pr-4 text-base"
                                placeholder="Requester Email (e.g., user@domain.com)"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <View className="absolute left-4">
                                <MaterialIcons name="email" size={24} color="#94a3b8" />
                            </View>
                        </View>
                    </View>

                    {/* Subject */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Subject</Text>
                        <TextInput
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 text-slate-900 dark:text-slate-100 h-14 px-4 text-base"
                            placeholder="Brief summary of the issue"
                            placeholderTextColor="#94a3b8"
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    {/* Department */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Department</Text>
                        <View className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 h-14 justify-center px-4">
                            <Text className="text-slate-500 dark:text-slate-400 text-base">Select a department...</Text>
                        </View>
                        {/* Note: Native Picker usually used here, mocked as a touchable for now */}
                    </View>

                    {/* Priority */}
                    <View className="py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium pb-2">Priority</Text>
                        <View className="flex-row h-12 rounded-lg bg-primary/10 p-1">
                            {['Low', 'Normal', 'High', 'Emergency'].map(p => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setPriorityText(p)}
                                    className={`flex-1 items-center justify-center rounded-lg ${priorityText === p ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                                >
                                    <Text className={`text-sm font-semibold ${priorityText === p ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {p}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Message */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Message</Text>
                        <TextInput
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 text-slate-900 dark:text-slate-100 min-h-[160px] p-4 text-base"
                            placeholder="Describe your issue in detail..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    {/* Attachments */}
                    <View className="py-3 mt-2">
                        <TouchableOpacity className="flex-row items-center justify-center w-full gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                            <MaterialIcons name="attach-file" size={24} color="#128c7e" />
                            <Text className="text-primary font-medium">Attach Files</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Submit */}
                    <View className="pt-6 pb-12">
                        <TouchableOpacity
                            className={`w-full bg-primary rounded-xl py-4 flex-row items-center justify-center shadow-sm ${loading ? 'opacity-80' : ''}`}
                            onPress={handleCreateTicket}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Submit Ticket</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
