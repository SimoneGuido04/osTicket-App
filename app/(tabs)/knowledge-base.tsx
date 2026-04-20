import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TopicService } from '../../services/api';

export default function KnowledgeBaseScreen() {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTopics = async () => {
        try {
            const data: any = await TopicService.getAllTopics();
            if (data && data.topics) {
                setTopics(data.topics);
            } else {
                setTopics([]);
            }
        } catch (error) {
            console.error('Failed to fetch topics', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTopics();
    };

    const filteredTopics = topics.filter(t =>
        t.topic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark pt-12">
            {/* Header */}
            <View className="flex-row items-center bg-background-light dark:bg-background-dark p-4 border-b border-primary/10 justify-between">
                <View className="flex-row items-center gap-3">
                    <View className="text-primary flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <MaterialIcons name="menu-book" size={24} color="#128c7e" />
                    </View>
                    <View>
                        <Text className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Help Topics</Text>
                        <Text className="text-xs text-slate-500 dark:text-slate-400">Search guides & information</Text>
                    </View>
                </View>
            </View>

            {/* Search */}
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row w-full items-center rounded-xl h-12 bg-white dark:bg-slate-800 border border-primary/10 px-4 shadow-sm">
                    <MaterialIcons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        className="flex-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-base ml-3"
                        placeholder="Search topics..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Topics List */}
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
                    {filteredTopics.map((topic) => (
                        <TouchableOpacity
                            key={topic.id.toString()}
                            className="flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 mb-3"
                        >
                            <View className="size-10 rounded-full bg-primary/10 items-center justify-center">
                                <MaterialIcons name="article" size={20} color="#128c7e" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-slate-900 dark:text-slate-100">{topic.topic}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}

                    {filteredTopics.length === 0 && (
                        <View className="flex-1 items-center justify-center pt-10">
                            <MaterialIcons name="search-off" size={48} color="#94a3b8" />
                            <Text className="text-slate-500 dark:text-slate-400 mt-4 text-center">No topics found matching your search.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
