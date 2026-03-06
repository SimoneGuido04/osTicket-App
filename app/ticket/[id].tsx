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
    const [replyMode, setReplyMode] = useState<'reply' | 'note'>('reply');

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
            if (replyMode === 'note') {
                await TicketService.addInternalNote({
                    ticket_id: id as string,
                    body: replyText,
                    staff_id: user?.id || 1
                });
            } else {
                const isAgent = user?.role === 'Agent';
                await TicketService.replyToTicket({
                    ticket_id: id as string,
                    body: replyText,
                    ...(isAgent ? { staff_id: user?.id || 1 } : { user_id: user?.id || 1 })
                });
            }
            setReplyText('');
            // Refresh ticket data to show new thread entry
            await fetchTicket();
        } catch (error) {
            console.error('Failed to reply', error);
            Alert.alert('Error', 'Failed to send ' + (replyMode === 'note' ? 'note' : 'reply') + '.');
        } finally {
            setSendingReply(false);
        }
    };

    const handleCloseTicket = async () => {
        if (isClosed) return;

        Alert.alert('Close Ticket', 'Are you sure you want to close this ticket?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Close',
                style: 'destructive',
                onPress: async () => {
                    setLoading(true);
                    try {
                        const firstEntry = ticketData[0];
                        await TicketService.closeTicket({
                            ticket_id: Number(firstEntry.ticket_id),
                            body: 'Ticket closed via Mobile App',
                            staff_id: Number(user?.id || 1),
                            status_id: 3, // Closed
                            team_id: Number(firstEntry.team_id || 0),
                            dept_id: Number(firstEntry.dept_id || 1),
                            topic_id: Number(firstEntry.topic_id || 1),
                            username: user?.username || 'Staff'
                        });
                        await fetchTicket();
                    } catch (error) {
                        console.error('Failed to close ticket', error);
                        Alert.alert('Error', 'Failed to close ticket.');
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
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
                        <TouchableOpacity
                            onPress={() => setReplyMode('reply')}
                            className={`flex-1 min-w-[120px] rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-2 ${replyMode === 'reply' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <MaterialIcons name="reply" size={18} color={replyMode === 'reply' ? 'white' : '#64748b'} />
                            <Text className={`text-sm font-bold ${replyMode === 'reply' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Reply</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setReplyMode('note')}
                            className={`flex-1 min-w-[120px] rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-2 ${replyMode === 'note' ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        >
                            <MaterialIcons name="note-add" size={18} color={replyMode === 'note' ? 'white' : '#64748b'} />
                            <Text className={`text-sm font-bold ${replyMode === 'note' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>Internal Note</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleCloseTicket}
                            disabled={isClosed}
                            className={`flex-1 min-w-[120px] bg-slate-200 dark:bg-slate-800 rounded-lg py-2.5 px-4 flex-row items-center justify-center gap-2 ${isClosed ? 'opacity-50' : ''}`}
                        >
                            <MaterialIcons name="lock" size={18} color="#64748b" />
                            <Text className="text-slate-600 dark:text-slate-400 text-sm font-bold">Close Ticket</Text>
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
                        const isNote = entry.thread_type === 'N';
                        const posterName = entry.poster_name || (isStaff ? 'Staff' : 'User');

                        // Using dangerouslySetInnerHTML logic equivalent
                        const cleanBody = String(entry.body).replace(/<[^>]+>/g, '').trim();

                        if (isNote) {
                            return (
                                <View key={index} className="flex-col items-center gap-3 w-full mt-4">
                                    <View className="flex-row items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl w-[90%]">
                                        <View className="size-8 rounded-full bg-amber-500 items-center justify-center">
                                            <MaterialIcons name="lock" size={16} color="white" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-xs font-bold text-amber-800 dark:text-amber-400">{posterName} (Internal Note)</Text>
                                                <Text className="text-[10px] text-amber-600/60 dark:text-amber-400/60">{new Date(entry.created).toLocaleTimeString()}</Text>
                                            </View>
                                            <Text className="text-sm leading-relaxed text-amber-900 dark:text-amber-200 mt-1">
                                                {cleanBody}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        }

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
                                    <View className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800">
                                        <MaterialIcons name="person" size={24} color="#94a3b8" />
                                    </View>
                                    <View className="flex-col gap-1 flex-1">
                                        <View className="flex-row items-center gap-2 px-1">
                                            <Text className="text-xs font-bold text-slate-900 dark:text-slate-100">{posterName}</Text>
                                            <Text className="text-[10px] text-slate-400">{new Date(entry.created).toLocaleTimeString()}</Text>
                                        </View>
                                        <View className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none border border-primary/5 shadow-sm">
                                            <Text className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
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
                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white"
                            placeholder={replyMode === 'note' ? 'Type your internal note here...' : 'Type your reply here...'}
                            placeholderTextColor="#94a3b8"
                            multiline
                            value={replyText}
                            onChangeText={setReplyText}
                        />
                        <TouchableOpacity
                            className={`mt-4 py-4 rounded-xl flex-row items-center justify-center gap-2 ${replyMode === 'note' ? 'bg-amber-600' : 'bg-primary'} ${sendingReply ? 'opacity-70' : ''}`}
                            onPress={handleReply}
                            disabled={sendingReply}
                        >
                            <Text className="text-white font-bold text-base">
                                {sendingReply ? (replyMode === 'note' ? 'Adding Note...' : 'Sending Reply...') : (replyMode === 'note' ? 'Add Note' : 'Send Reply')}
                            </Text>
                            {!sendingReply && <MaterialIcons name={replyMode === 'note' ? 'note' : 'send'} size={20} color="white" />}
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
