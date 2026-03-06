import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TicketService } from '../../services/api';

// Interface matching BMSVieira API Response for Tickets
interface Ticket {
    ticket_id: number;
    number: string;
    status: string;
    status_id: number | string;
    name: string;
    subject: string;
    created: string;
    isoverdue: number | string;
}

export default function TicketsScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All Tickets');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const filters = ['All Tickets', 'Open', 'My Tickets', 'Closed'];

    const fetchTickets = async () => {
        try {
            const data: any = await TicketService.getAllTickets();
            if (data && data.tickets) {
                setTickets(data.tickets);
            } else {
                setTickets([]);
            }
        } catch (error) {
            console.error('Failed to fetch tickets', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    // Filter + search logic
    const filteredTickets = useMemo(() => {
        let list = tickets;

        // Apply filter chip
        if (activeFilter === 'Open') {
            list = list.filter(t => String(t.status_id) === '1');
        } else if (activeFilter === 'Closed') {
            list = list.filter(t => String(t.status_id) === '3');
        }
        // 'My Tickets' and 'All Tickets' pass through for now (requires staff_id matching via useAuth)

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t =>
                String(t.number).toLowerCase().includes(q) ||
                String(t.subject).toLowerCase().includes(q) ||
                String(t.name).toLowerCase().includes(q)
            );
        }

        return list;
    }, [tickets, activeFilter, searchQuery]);

    const openCount = useMemo(() => {
        return tickets.filter(t => String(t.status_id) === '1').length;
    }, [tickets]);

    const renderTicket = ({ item }: { item: Ticket }) => {
        // osTicket numeric statuses generally: 1=Open, 2=Resolved, 3=Closed (varies by setup)
        // Adjusting logic to display gracefully even if string vs int
        const isClosed = String(item.status_id) === '3';
        const isOpen = String(item.status_id) === '1';

        const displayStatus = isClosed ? 'Closed' : (isOpen ? 'Open' : 'Pending');

        const statusBg = isOpen ? 'bg-green-50 dark:bg-green-900/30' : (!isClosed ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-700');
        const statusColor = isOpen ? 'text-green-700 dark:text-green-400' : (!isClosed ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-slate-300');
        const statusBorder = isOpen ? 'border-green-200 dark:border-green-800' : (!isClosed ? 'border-orange-200 dark:border-orange-800' : 'border-slate-200 dark:border-slate-600');

        return (
            <TouchableOpacity
                className={`flex-col gap-3 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm border border-slate-100 dark:border-slate-700 mb-3 ${isClosed ? 'opacity-80' : ''}`}
                onPress={() => router.push(`/ticket/${item.ticket_id}`)}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-col gap-1 flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-xs font-bold text-primary tracking-wider uppercase">#{item.number}</Text>
                            {/* Re-add Priority Color Circle here if API supports it in the future */}
                        </View>
                        <Text className={`text-base font-bold text-slate-900 dark:text-slate-100 ${isClosed ? 'line-through text-slate-500' : ''}`}>
                            {item.subject}
                        </Text>
                    </View>
                    <View className={`items-center rounded-md px-2 py-1 border ${statusBg} ${statusBorder}`}>
                        <Text className={`text-xs font-medium ${statusColor}`}>{displayStatus}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-1">
                    <View className="flex-row items-center gap-2">
                        <View className={`size-7 rounded-full flex items-center justify-center overflow-hidden ${isClosed ? 'bg-slate-100 dark:bg-slate-700' : 'bg-primary/20'}`}>
                            <MaterialIcons name="person" size={16} color={isClosed ? '#94a3b8' : '#128c7e'} />
                        </View>
                        <Text className={`text-sm font-medium ${isClosed ? 'text-slate-500' : 'text-slate-600 dark:text-slate-400'}`}>
                            {item.name}
                        </Text>
                    </View>
                    <Text className="text-xs text-slate-400 dark:text-slate-500">{new Date(item.created).toLocaleDateString()}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 border-b border-primary/10 justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="text-primary flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <MaterialIcons name="confirmation-number" size={24} color="#128c7e" />
                    </View>
                    <View>
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Support Tickets</Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">osTicket Management</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="flex size-10 items-center justify-center rounded-full bg-primary"
                    onPress={() => router.push('/new-ticket')}
                >
                    <MaterialIcons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search & Filters */}
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row w-full items-center rounded-xl h-12 bg-primary/5 dark:bg-primary/10 border border-primary/10 px-4">
                    <MaterialIcons name="search" size={20} color="#128c7e" />
                    <TextInput
                        className="flex-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base ml-3"
                        placeholder="Search by ID, Subject or User..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity>
                        <MaterialIcons name="tune" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 pb-2" contentContainerStyle={{ gap: 8 }}>
                    {filters.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`flex h-9 items-center justify-center rounded-full px-5 flex-row gap-2 ${activeFilter === filter ? 'bg-primary' : 'bg-white dark:bg-slate-800 border border-primary/20'}`}
                        >
                            <Text className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                {filter}
                            </Text>
                            {filter === 'Open' && (
                                <View className={`h-5 min-w-[20px] items-center justify-center rounded-full px-1 ${activeFilter === filter ? 'bg-white/20' : 'bg-primary/10'}`}>
                                    <Text className={`text-[10px] font-bold ${activeFilter === filter ? 'text-white' : 'text-primary'}`}>{openCount}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Ticket List */}
            {loading ? (
                <View className="flex-1 items-center justify-center pt-10">
                    <ActivityIndicator size="large" color="#128c7e" />
                </View>
            ) : (
                <FlatList
                    data={filteredTickets}
                    keyExtractor={item => item.ticket_id.toString()}
                    renderItem={renderTicket}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#128c7e"]} />}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-10">
                            <Text className="text-slate-500 dark:text-slate-400">No tickets found.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
