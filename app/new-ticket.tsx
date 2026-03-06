import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SelectionModal } from '../components/SelectionModal';
import { UserSelectionModal } from '../components/UserSelectionModal';
import { DepartmentService, PriorityService, TicketService, TopicService, UserService } from '../services/api';

export default function NewTicketScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    const [departments, setDepartments] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>([]);

    const [selectedDeptId, setSelectedDeptId] = useState<number>(1);
    const [selectedTopicId, setSelectedTopicId] = useState<number>(1);
    const [selectedPriorityId, setSelectedPriorityId] = useState<number>(2);

    const [deptModalVisible, setDeptModalVisible] = useState(false);
    const [topicModalVisible, setTopicModalVisible] = useState(false);
    const [priorityModalVisible, setPriorityModalVisible] = useState(false);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [deptRes, topicRes, prioRes] = await Promise.all([
                DepartmentService.getAllDepartments(),
                TopicService.getAllTopics(),
                PriorityService.getAllPriorities(),
            ]);
            if (deptRes.departments) setDepartments(deptRes.departments);
            if (topicRes.topics) setTopics(topicRes.topics);
            if (prioRes.priorities) setPriorities(prioRes.priorities);
        } catch (error) {
            console.error('Failed to fetch metadata', error);
        }
    };

    const handleCreateTicket = async () => {
        if (!email || !subject || !message) {
            Alert.alert('Error', 'Please fill in the user email, subject, and message.');
            return;
        }

        setLoading(true);

        try {
            // 1. Find User ID by Email (if not already selected)
            let userId = selectedUserId;
            if (!userId) {
                const userResult: any = await UserService.findUserByEmail(email);
                if (!userResult || !userResult.users || userResult.users.length === 0) {
                    Alert.alert('Error', 'No user found with that email address.');
                    setLoading(false);
                    return;
                }
                userId = userResult.users[0].user_id;
            }

            // 2. Create Ticket
            await TicketService.createTicket({
                user_id: userId as number,
                title: subject,
                subject: message,
                priority_id: selectedPriorityId,
                status_id: 1, // Open
                dept_id: selectedDeptId,
                sla_id: 1,
                topic_id: selectedTopicId
            });

            Alert.alert('Success', 'Ticket created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Failed to create ticket', error);
            Alert.alert('Error', error.message || 'Failed to create the ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = (user: { email: string; name: string; user_id: number }) => {
        setEmail(user.email);
        setSelectedUserId(user.user_id);
        setModalVisible(false);
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
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
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

                    {/* Help Topic */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Help Topic</Text>
                        <TouchableOpacity
                            onPress={() => setTopicModalVisible(true)}
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 h-14 justify-between items-center px-4 flex-row"
                        >
                            <Text className="text-slate-900 dark:text-slate-100 text-base">
                                {topics.find(t => t.id === selectedTopicId)?.topic || 'Select a topic...'}
                            </Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* Department */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Department</Text>
                        <TouchableOpacity
                            onPress={() => setDeptModalVisible(true)}
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 h-14 justify-between items-center px-4 flex-row"
                        >
                            <Text className="text-slate-900 dark:text-slate-100 text-base">
                                {departments.find(d => d.department_id === selectedDeptId)?.name || 'Select a department...'}
                            </Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* Priority */}
                    <View className="flex-col gap-2 py-3">
                        <Text className="text-slate-900 dark:text-slate-100 text-base font-medium">Priority</Text>
                        <TouchableOpacity
                            onPress={() => setPriorityModalVisible(true)}
                            className="w-full rounded-lg bg-white dark:bg-slate-800 border border-primary/20 h-14 justify-between items-center px-4 flex-row"
                        >
                            <Text className="text-slate-900 dark:text-slate-100 text-base">
                                {priorities.find(p => p.id === selectedPriorityId)?.name || 'Select priority...'}
                            </Text>
                            <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
                        </TouchableOpacity>
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

            <UserSelectionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSelect={handleSelectUser}
            />

            <SelectionModal
                visible={deptModalVisible}
                onClose={() => setDeptModalVisible(false)}
                onSelect={(val) => setSelectedDeptId(val)}
                title="Select Department"
                options={departments.map(d => ({ label: d.name, value: d.department_id }))}
            />

            <SelectionModal
                visible={topicModalVisible}
                onClose={() => setTopicModalVisible(false)}
                onSelect={(val) => setSelectedTopicId(val)}
                title="Select Help Topic"
                options={topics.map(t => ({ label: t.topic, value: t.id }))}
            />

            <SelectionModal
                visible={priorityModalVisible}
                onClose={() => setPriorityModalVisible(false)}
                onSelect={(val) => setSelectedPriorityId(val)}
                title="Select Priority"
                options={priorities.map(p => ({ label: p.name, value: p.id }))}
            />
        </SafeAreaView>
    );
}
