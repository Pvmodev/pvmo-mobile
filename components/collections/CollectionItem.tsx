import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Collection {
    key: string;
    isActive: boolean;
    displayName: string;
    description: string;
    icon: string;
}

interface CollectionItemProps {
    item: Collection;
    onToggle: (key: string, status: boolean) => void;
    onAddProduct: (key: string) => void;
}

export default function CollectionItem({ item, onToggle, onAddProduct }: CollectionItemProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const router = useRouter();

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            delay: Math.random() * 200,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleCardPress = () => {
        router.push(`/collection-items?collectionKey=${item.key}`);
    };

    const handleTogglePress = (event: any) => {
        event.stopPropagation(); // Prevent card press
        onToggle(item.key, item.isActive);
    };

    const handleAddProductPress = (event: any) => {
        event.stopPropagation(); // Prevent card press
        onAddProduct(item.key);
    };

    return (
        <Animated.View
            style={{
                opacity: animatedValue,
                transform: [
                    {
                        translateY: animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }),
                    },
                ],
            }}
        >
            <TouchableOpacity
                style={styles.collectionCard}
                onPress={handleCardPress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.collectionGradient}
                >
                    <View style={styles.collectionHeader}>
                        <View style={styles.collectionIconContainer}>
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color={item.isActive ? '#667eea' : '#999'}
                            />
                        </View>
                        <View style={styles.collectionInfo}>
                            <Text style={styles.collectionName}>{item.displayName}</Text>
                            <Text style={styles.collectionDescription}>{item.description}</Text>
                        </View>
                        <View style={styles.collectionActions}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: item.isActive ? '#4CAF50' : '#FF9800' }
                            ]}>
                                <Text style={styles.statusText}>
                                    {item.isActive ? 'Ativa' : 'Inativa'}
                                </Text>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color="rgba(255,255,255,0.6)"
                                style={styles.chevronIcon}
                            />
                        </View>
                    </View>

                    <View style={styles.collectionFooter}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: item.isActive ? '#FF6B6B' : '#4CAF50' }
                            ]}
                            onPress={handleTogglePress}
                        >
                            <Ionicons
                                name={item.isActive ? 'pause' : 'play'}
                                size={16}
                                color="white"
                            />
                            <Text style={styles.actionButtonText}>
                                {item.isActive ? 'Desativar' : 'Ativar'}
                            </Text>
                        </TouchableOpacity>

                        {item.isActive && (
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#667eea' }]}
                                onPress={handleAddProductPress}
                            >
                                <Ionicons name="add" size={16} color="white" />
                                <Text style={styles.actionButtonText}>Produto</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
                            onPress={handleCardPress}
                        >
                            <Ionicons name="list" size={16} color="white" />
                            <Text style={styles.actionButtonText}>Ver Itens</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    collectionCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    collectionGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 16,
    },
    collectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    collectionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    collectionDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    collectionActions: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 11,
        color: 'white',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    chevronIcon: {
        marginLeft: 4,
    },
    collectionFooter: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionButtonText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
});