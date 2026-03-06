import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { TicketService } from '../../services/api';

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [ticketData, setTicketData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    const fetchTicket = async () => {
        try {
            const data: any = await TicketService.getTicketById(id as string);
            if (data && data.tickets) {
                setTicketData(data.tickets);
            }
        } catch (error) {
            console.error('Failed to fetch ticket info', error);
            Alert.alert('Error', 'Failed to load ticket details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            await TicketService.replyToTicket({
                ticket_id: id as string,
                body: replyText,
                staff_id: user?.id || 1 // Fallback to 1 if no user staff id found
            });
            setReplyText('');
            // Refresh ticket data to show new thread entry
            await fetchTicket();
        } catch (error) {
            console.error('Failed to reply', error);
            Alert.alert('Error', 'Failed to send reply.');
        } finally {
            setSendingReply(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark justify-center items-center">
                <ActivityIndicator size="large" color="#128c7e" />
            </SafeAreaView>
        );
    }

    const firstEntry = ticketData && ticketData.length > 0 ? ticketData[0] : null;

    if (!firstEntry) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12 px-4 justify-center items-center">
                <Text className="text-slate-500">Ticket not found or no access.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-4 py-2 rounded">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Determine Status
    const isClosed = String(firstEntry.status_id) === '3' || String(firstEntry.status).toLowerCase().includes('close');
    const displayStatus = isClosed ? 'Closed' : 'Open';

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="bg-background-light/80 dark:bg-background-dark/80 border-b border-primary/10 px-4 py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                    <TouchableOpacity
                        className="p-2 rounded-full text-primary"
                        onPress={() => router.back()}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#128c7e" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight" numberOfLines={1}>
                            #{firstEntry.number} - {firstEntry.subject}
                        </Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">
                            Opened {new Date(firstEntry.created).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-1">
                    <TouchableOpacity className="p-2 rounded-full">
                        <MaterialIcons name="search" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 rounded-full">
                        <MaterialIcons name="more-vert" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Ticket Summary Card */}
                <View className="p-4 border-b border-primary/10 bg-white dark:bg-slate-900/50">
                    <View className="flex-row flex-wrap gap-y-4 mb-4">
                        <View className="flex-col w-1/2">
                            <Text className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Status</Text>
                            <View className="flex-row items-center gap-1">
                                <View className={`size-2 rounded-full ${isClosed ? 'bg-slate-400' : 'bg-green-500'}`} />
                                <Text className={`text-sm font-semibold ${isClosed ? 'text-slate-600' : 'text-green-600'}`}>{displayStatus}</Text>
                            </View>
                        </View>
                        <View className="flex-col w-1/2">
                            <Text className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Created</Text>
                            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{new Date(firstEntry.created).toLocaleDateString()}</Text>
                        </View>
                        <View className="flex-col w-1/2 mt-2">
                            <Text className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Source</Text>
                            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{firstEntry.source || 'Unknown'}</Text>
                        </View>
                        <View className="flex-col w-1/2 mt-2">
                            <Text className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Last Update</Text>
                            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100">{new Date(firstEntry.updated).toLocaleDateString()}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row flex-wrap gap-2">
                        <TouchableOpacity className="flex-1 min-w-[120px] bg-primary rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-2">
                            <MaterialIcons name="reply" size={18} color="white" />
                            <Text className="text-white font-bold text-sm">Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 min-w-[120px] bg-primary/10 border border-primary/20 rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-2">
                            <MaterialIcons name="note-add" size={18} color="#128c7e" />
                            <Text className="text-primary font-bold text-sm">Internal Note</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg items-center justify-center">
                            <Text className="font-bold text-sm text-slate-600 dark:text-slate-300">Close Ticket</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chat Area */}
                <View className="p-4 space-y-6 flex-col gap-6">
                    {/* System Event */}
                    <View className="items-center">
                        <View className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                            <Text className="text-[11px] text-slate-500 font-medium">Ticket Created • {new Date(firstEntry.created).toLocaleTimeString()}</Text>
                        </View>
                    </View>

                    {ticketData.map((entry: any, index: number) => {
                        const isStaff = entry.staff_id > 0;
                        const posterName = entry.staff_id > 0 ? 'Staff' : 'User'; // Without full user table joins, we rely on the staff flag

                        // Using dangerouslySetInnerHTML logic equivalent (stripping HTML natively is hard, so we assume plain text or simple formatting for now)
                        // In a real app we'd use react-native-render-html.
                        const cleanBody = String(entry.body).replace(/<[^>]+>/g, '').trim();

                        if (isStaff) {
                            return (
                                <View key={index} className="flex-row-reverse items-start gap-3 w-[90%] self-end mt-4">
                                    <View className="size-10 rounded-full bg-primary/20 items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800">
                                        <MaterialIcons name="support-agent" size={20} color="#128c7e" />
                                    </View>
                                    <View className="flex-col items-end gap-1 flex-1">
                                        <View className="flex-row items-center gap-2 px-1">
                                            <Text className="text-[10px] text-slate-400">{new Date(entry.created).toLocaleTimeString()}</Text>
                                            <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">{posterName}</Text>
                                        </View>
                                        <View className="bg-primary p-4 rounded-xl rounded-tr-none shadow-sm">
                                            <Text className="text-sm leading-relaxed text-white">
                                                {cleanBody}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        } else {
                            return (
                                <View key={index} className="flex-row items-start gap-3 w-[90%] mt-4">
                                    <View className="size-10 rounded-full bg-slate-300 items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800">
                                        <MaterialIcons name="person" size={24} color="#94a3b8" />
                                    </View>
                                    <View className="flex-col gap-1 flex-1">
                                        <View className="flex-row items-center gap-2 px-1">
                                            <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">{posterName}</Text>
                                            <Text className="text-[10px] text-slate-400">{new Date(entry.created).toLocaleTimeString()}</Text>
                                        </View>
                                        <View className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none border border-primary/5 shadow-sm">
                                            <Text className="text-sm leading-relaxed text-slate-900 dark:text-slate-100">
                                                {cleanBody}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }
                    })}
                </View>

                {/* Reply Section */}
                {!isClosed && (
                    <View className="p-4 bg-white dark:bg-slate-900 border-t border-primary/10 mt-4">
                        <TextInput
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-slate-100 min-h-[100px]"
                            multiline
                            textAlignVertical="top"
                            placeholder="Type your reply here..."
                            placeholderTextColor="#94a3b8"
                            value={replyText}
                            onChangeText={setReplyText}
                        />
                        <View className="flex-row justify-end mt-3">
                            <TouchableOpacity
                                className={`bg-primary px-6 py-3 rounded-lg flex-row items-center gap-2 ${sendingReply || !replyText.trim() ? 'opacity-50' : ''}`}
                                onPress={handleReply}
                                disabled={sendingReply || !replyText.trim()}
                            >
                                <Text className="text-white font-bold">{sendingReply ? 'Sending...' : 'Send Reply'}</Text>
                                {!sendingReply && <MaterialIcons name="send" size={16} color="white" />}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
