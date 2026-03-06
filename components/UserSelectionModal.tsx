import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserService } from '../services/api';

interface UserSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (user: { email: string; name: string; user_id: number }) => void;
}

export function UserSelectionModal({ visible, onClose, onSelect }: UserSelectionModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            handleSearch('');
        } else {
            setSearchQuery('');
            setUsers([]);
        }
    }, [visible]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        setLoading(true);
        try {
            // If query is empty, maybe get all users or just clear
            const result: any = await UserService.searchUsers(query);
            if (result && result.users) {
                setUsers(result.users);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to search users', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-slate-900 rounded-t-[32px] h-[80%] p-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Select User</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <MaterialIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="relative justify-center mb-6">
                        <TextInput
                            className="bg-slate-100 dark:bg-slate-800 rounded-xl h-12 pl-12 pr-4 text-slate-900 dark:text-white"
                            placeholder="Search by name or email..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCapitalize="none"
                        />
                        <View className="absolute left-4">
                            <MaterialIcons name="search" size={20} color="#94a3b8" />
                        </View>
                        {loading && (
                            <View className="absolute right-4">
                                <ActivityIndicator size="small" color="#128c7e" />
                            </View>
                        )}
                    </View>

                    {/* Users List */}
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.user_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item)}
                                className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800"
                            >
                                <View className="size-10 rounded-full bg-primary/10 items-center justify-center mr-4">
                                    <Text className="text-primary font-bold">{item.name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 dark:text-white font-semibold">{item.name}</Text>
                                    <Text className="text-slate-500 dark:text-slate-400 text-sm">{item.email}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="flex-1 items-center justify-center pt-10">
                                <Text className="text-slate-400">No users found.</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
