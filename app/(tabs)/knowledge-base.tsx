import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, Text } from 'react-native';

export default function KnowledgeBaseScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center p-6">
            <MaterialIcons name="menu-book" size={64} color="#128c7e" />
            <Text className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-4 text-center">Knowledge Base</Text>
            <Text className="text-base text-slate-500 dark:text-slate-400 mt-2 text-center">
                Search articles, FAQs, and documentation to resolve issues quickly.
            </Text>
        </SafeAreaView>
    );
}
