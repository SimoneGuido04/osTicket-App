import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserService } from '../../services/api';

interface User {
    user_id: number;
    name: string;
    created: string;
    // Note: The BMSVieira API does not return email or role in the 'all' endpoint
}

export default function UsersScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUsers = async () => {
        try {
            const data: any = await UserService.getAllUsers();
            if (data && data.users) {
                setUsers(data.users);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 border-b border-primary/10 justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="text-primary flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <MaterialIcons name="group" size={24} color="#128c7e" />
                    </View>
                    <View>
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Users Directory</Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">Manage clients and agents</Text>
                    </View>
                </View>
                <TouchableOpacity className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <MaterialIcons name="person-add" size={24} color="#128c7e" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row w-full items-center rounded-xl h-12 bg-white dark:bg-slate-800 border border-primary/10 px-4 shadow-sm">
                    <MaterialIcons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        className="flex-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base ml-3"
                        placeholder="Search directory..."
                        placeholderTextColor="#94a3b8"
                    />
                </View>
            </View>

            {/* Users List */}
            {loading ? (
                <View className="flex-1 items-center justify-center pt-10">
                    <ActivityIndicator size="large" color="#128c7e" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, paddingTop: 8 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#128c7e"]} />}
                >
                    {users.map((user, index) => {
                        // Alternate colors for visually pleasing avatars
                        const colorStyles = [
                            'bg-blue-100 text-blue-600',
                            'bg-green-100 text-green-600',
                            'bg-purple-100 text-purple-600',
                            'bg-orange-100 text-orange-600',
                            'bg-pink-100 text-pink-600'
                        ];
                        const bgStyle = colorStyles[index % colorStyles.length];

                        return (
                            <TouchableOpacity
                                key={user.user_id.toString()}
                                className="flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-3"
                            >
                                <View className={`size-12 rounded-full flex items-center justify-center overflow-hidden ${bgStyle.split(' ')[0]}`}>
                                    <Text className={`font-bold text-lg ${bgStyle.split(' ')[1]}`}>{user.name.charAt(0)}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{user.name}</Text>
                                    <Text className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(user.created).toLocaleDateString()}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded border bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600`}>
                                    <Text className={`text-xs font-bold text-slate-500 dark:text-slate-400`}>
                                        User
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {users.length === 0 && (
                        <View className="flex-1 items-center justify-center pt-10">
                            <Text className="text-slate-500 dark:text-slate-400">No users found.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
