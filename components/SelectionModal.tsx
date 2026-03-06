import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface Option {
    label: string;
    value: any;
}

interface SelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (value: any) => void;
    title: string;
    options: Option[];
}

export function SelectionModal({ visible, onClose, onSelect, title, options }: SelectionModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-slate-900 rounded-t-[32px] max-h-[80%] p-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">{title}</Text>
                        <TouchableOpacity onPress={onClose} className="p-2">
                            <MaterialIcons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Options List */}
                    <FlatList
                        data={options}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelect(item.value);
                                    onClose();
                                }}
                                className="flex-row items-center py-4 border-b border-slate-100 dark:border-slate-800"
                            >
                                <Text className="flex-1 text-slate-900 dark:text-white text-base">
                                    {item.label}
                                </Text>
                                <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-10">
                                <Text className="text-slate-400">No options available.</Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
