import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../hooks/useAuth';
import { TicketService } from '../../services/api';

export default function DashboardScreen() {
    const { user } = useAuth();
    const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'AG';
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ open: 0, overdue: 0, assigned: 0 });
    const [recentTickets, setRecentTickets] = useState<any[]>([]);
    const [chartData, setChartData] = useState<{ labels: string[], data: number[] }>({ labels: [], data: [] });

    // Get screen width for chart
    const screenWidth = Dimensions.get('window').width;

    const fetchDashboardData = async () => {
        try {
            // Using getAllTickets which currently fetches all Open tickets (status: 0)
            const data: any = await TicketService.getAllTickets();
            const tickets = data?.tickets || [];

            setStats({
                open: tickets.filter((t: any) => String(t.status_id) === '1').length,
                overdue: tickets.filter((t: any) => String(t.isoverdue) === '1').length,
                assigned: tickets.filter((t: any) => t.staff_id && t.staff_id === user?.id).length
            });

            // Grab the 3 most recently updated tickets as 'recent updates'
            const sorted = [...tickets].sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
            setRecentTickets(sorted.slice(0, 3));

            // Prepare Chart Data (Aggregating tickets created over the last 7 days)
            const labels: string[] = [];
            const counts: number[] = [0, 0, 0, 0, 0, 0, 0];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
            }

            tickets.forEach((t: any) => {
                const createdDate = new Date(t.created);
                createdDate.setHours(0, 0, 0, 0);
                const diffTime = Math.abs(today.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 7) {
                    // Match to the correct bucket (0 is today = index 6, 1 is yesterday = index 5, etc)
                    counts[6 - diffDays]++;
                }
            });

            setChartData({ labels, data: counts });

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="flex-row items-center p-4 justify-between border-b border-primary/10 bg-background-light dark:bg-background-dark">
                <TouchableOpacity className="size-10 flex items-center justify-center rounded-lg bg-primary/10">
                    <MaterialIcons name="menu" size={24} color="#128c7e" />
                </TouchableOpacity>

                <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold flex-1 px-4">Agent Dashboard</Text>

                <View className="flex-row items-center gap-2">
                    <TouchableOpacity className="relative size-10 flex items-center justify-center rounded-full bg-primary/10">
                        <MaterialIcons name="notifications" size={24} color="#128c7e" />
                        <View className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-background-light dark:border-background-dark" />
                    </TouchableOpacity>
                    <View className="size-8 rounded-full bg-primary flex items-center justify-center">
                        <Text className="text-white text-xs font-bold">{initials}</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#128c7e" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 24 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#128c7e"]} />}
                >
                    {/* Stats Grid */}
                    <View className="p-4 flex-col gap-4">
                        {/* Open Tickets */}
                        <View className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-primary/5 shadow-sm">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Open Tickets</Text>
                                <MaterialIcons name="confirmation-number" size={20} color="#128c7e" />
                            </View>
                            <Text className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-1">{stats.open}</Text>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="trending-up" size={14} color="#10b981" />
                                <Text className="text-emerald-500 text-xs font-semibold">Active workload</Text>
                            </View>
                        </View>

                        {/* Overdue */}
                        <View className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-primary/5 shadow-sm">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overdue</Text>
                                <MaterialIcons name="warning" size={20} color="#ef4444" />
                            </View>
                            <Text className="text-red-600 dark:text-red-400 text-3xl font-bold mb-1">{stats.overdue}</Text>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="error" size={14} color="#ef4444" />
                                <Text className="text-red-500 text-xs font-semibold">Requires immediate action</Text>
                            </View>
                        </View>

                        {/* Assigned to Me */}
                        <View className="rounded-xl p-5 bg-white dark:bg-slate-800 border border-primary/5 shadow-sm">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Assigned to Me</Text>
                                <MaterialIcons name="person" size={20} color="#128c7e" />
                            </View>
                            <Text className="text-slate-900 dark:text-slate-100 text-3xl font-bold mb-1">{stats.assigned}</Text>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="sync" size={14} color="#94a3b8" />
                                <Text className="text-slate-400 text-xs font-semibold">Your current focus</Text>
                            </View>
                        </View>
                    </View>

                    {/* Ticket Volume Chart */}
                    <View className="px-4 py-2">
                        <View className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-primary/5 shadow-sm">
                            <View className="flex-row justify-between items-end mb-6">
                                <View>
                                    <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold">Ticket Volume</Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm">Tickets opened over last 7 days</Text>
                                </View>
                            </View>

                            {chartData.labels.length > 0 && (
                                <View className="-ml-4 overflow-hidden rounded-xl">
                                    <LineChart
                                        data={{
                                            labels: chartData.labels,
                                            datasets: [{ data: chartData.data }]
                                        }}
                                        width={screenWidth - 60} // Padding accounted for
                                        height={180}
                                        chartConfig={{
                                            backgroundColor: 'transparent',
                                            backgroundGradientFrom: '#ffffff',
                                            backgroundGradientTo: '#ffffff',
                                            backgroundGradientFromOpacity: 0,
                                            backgroundGradientToOpacity: 0,
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(18, 140, 126, ${opacity})`, // Primary color
                                            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // slate-400
                                            style: { borderRadius: 16 },
                                            propsForDots: { r: '4', strokeWidth: '2', stroke: '#128c7e' }
                                        }}
                                        bezier
                                        style={{ marginVertical: 8, borderRadius: 16 }}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Recent Updates */}
                    <View className="p-4">
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold mb-4">Recent Updates</Text>
                        <View className="flex-col gap-3">
                            {recentTickets.length === 0 ? (
                                <Text className="text-slate-500 dark:text-slate-400 text-center py-4">No recent updates</Text>
                            ) : (
                                recentTickets.map(ticket => (
                                    <TouchableOpacity key={ticket.ticket_id} className="flex-row items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-primary/5">
                                        <View className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <MaterialIcons name="confirmation-number" size={20} color="#2563eb" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-sm font-semibold text-slate-900 dark:text-slate-100" numberOfLines={1}>
                                                #{ticket.number} - {ticket.subject}
                                            </Text>
                                            <Text className="text-xs text-slate-500">Updated {new Date(ticket.updated).toLocaleDateString()}</Text>
                                        </View>
                                        <Text className={`text-xs font-bold ${ticket.isoverdue === '1' ? 'text-red-500' : 'text-primary'}`}>
                                            {ticket.isoverdue === '1' ? 'OVERDUE' : 'OPEN'}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>
    );
}
