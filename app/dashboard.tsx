import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Card de informação do usuário
const UserInfoCard = ({ user }: { user: any }) => {
    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'pvmo_admin':
                return 'Administrador PVMO';
            case 'store_client':
                return 'Cliente da Loja';
            case 'employee':
                return 'Funcionário';
            default:
                return role;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'pvmo_admin':
                return '#667eea';
            case 'store_client':
                return '#4CAF50';
            case 'employee':
                return '#FF9800';
            default:
                return '#999';
        }
    };

    return (
        <View style={styles.userInfoCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.userInfoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.userInfoHeader}>
                    <View style={styles.userIconContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.userIcon}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="person" size={24} color="white" />
                        </LinearGradient>
                    </View>
                    <View style={styles.userInfoContent}>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                            <View style={[styles.roleDot, { backgroundColor: getRoleColor(user.role) }]} />
                            <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                                {getRoleDisplayName(user.role)}
                            </Text>
                        </View>
                        {user.storeId && (
                            <Text style={styles.storeId}>Loja: {user.storeId}</Text>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

// Menu de opções
const MenuOption = ({ icon, title, subtitle, onPress, color = '#667eea', index }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
    index: number;
}) => {
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.menuOptionContainer,
                {
                    opacity: animatedValue,
                    transform: [
                        {
                            translateY: animatedValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <TouchableOpacity
                style={styles.menuOption}
                onPress={onPress}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                    style={styles.menuOptionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.menuOptionContent}>
                        <View style={[styles.menuOptionIcon, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon as any} size={24} color={color} />
                        </View>
                        <View style={styles.menuOptionText}>
                            <Text style={styles.menuOptionTitle}>{title}</Text>
                            <Text style={styles.menuOptionSubtitle}>{subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function DashboardScreen() {
    const [isLoading, setIsLoading] = useState(false);

    // Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;
    const headerAnim = React.useRef(new Animated.Value(-50)).current;

    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            router.replace('/login');
            return;
        }

        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(headerAnim, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isAuthenticated, user]);

    const handleLogout = async () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Erro no logout:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleMyStoreManagement = () => {
        router.navigate("/store-dashboard")
    };

    const handleStoresManagement = () => {
        router.navigate("/store-management")
    }

    const handleUserManagement = () => {
        Alert.alert('Em desenvolvimento', 'Funcionalidade de gerenciamento de usuários em desenvolvimento');
    };

    const handleAnalytics = () => {
        Alert.alert('Em desenvolvimento', 'Funcionalidade de analytics em desenvolvimento');
    };

    const handleSettings = () => {
        Alert.alert('Em desenvolvimento', 'Funcionalidade de configurações em desenvolvimento');
    };

    const handleProfile = () => {
        Alert.alert('Em desenvolvimento', 'Funcionalidade de perfil em desenvolvimento');
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#1a1a2e', '#16213e', '#0f3460']}
                    style={StyleSheet.absoluteFillObject}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#1a1a2e', '#16213e', '#0f3460']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative circles */}
            <View style={styles.backgroundCircle1} />
            <View style={styles.backgroundCircle2} />
            <View style={styles.backgroundCircle3} />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    {
                        transform: [{ translateY: headerAnim }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcome}>Bem-vindo,</Text>
                            <Text style={styles.userName}>{user.name}!</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={isLoading ? ['#999', '#777'] : ['#F44336', '#D32F2F']}
                                style={styles.logoutGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="log-out-outline" size={18} color="white" />
                                        <Text style={styles.logoutText}>Sair</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </Animated.View>

            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* User Info Card */}
                    <UserInfoCard user={user} />

                    {/* Menu Options */}
                    <View style={styles.menuContainer}>
                        <Text style={styles.menuTitle}>Menu Principal</Text>

                        <>
                            <MenuOption
                                icon="storefront-outline"
                                title="Gerenciar Lojas"
                                subtitle="Visualizar e gerenciar todas as lojas"
                                onPress={handleStoresManagement}
                                color="#667eea"
                                index={0}
                            />
                            <MenuOption
                                icon="people-outline"
                                title="Gerenciar Usuários"
                                subtitle="Administrar usuários do sistema"
                                onPress={handleUserManagement}
                                color="#4CAF50"
                                index={1}
                            />
                        </>

                        <MenuOption
                            icon="storefront-outline"
                            title="Minha Loja"
                            subtitle="Gerenciar produtos e vendas"
                            onPress={handleMyStoreManagement}
                            color="#667eea"
                            index={0}
                        />

                        <MenuOption
                            icon="analytics-outline"
                            title="Analytics"
                            subtitle="Relatórios e estatísticas"
                            onPress={handleAnalytics}
                            color="#FF9800"
                            index={user.role === 'PVMO_ADMIN' ? 2 : 1}
                        />

                        <MenuOption
                            icon="person-outline"
                            title="Meu Perfil"
                            subtitle="Gerenciar informações pessoais"
                            onPress={handleProfile}
                            color="#9C27B0"
                            index={user.role === 'PVMO_ADMIN' ? 3 : 2}
                        />

                        <MenuOption
                            icon="settings-outline"
                            title="Configurações"
                            subtitle="Preferências e configurações"
                            onPress={handleSettings}
                            color="#607D8B"
                            index={user.role === 'PVMO_ADMIN' ? 4 : 3}
                        />
                    </View>

                    <View style={styles.bottomSpacing} />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },

    // Background decorations
    backgroundCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        top: -50,
        right: -50,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(118, 75, 162, 0.1)',
        bottom: 100,
        left: -30,
    },
    backgroundCircle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: height * 0.3,
        left: width * 0.8,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },

    // Header styles
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerGradient: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    welcomeSection: {
        flex: 1,
    },
    welcome: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '300',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 2,
    },
    logoutButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    logoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        minWidth: 80,
        justifyContent: 'center',
    },
    logoutText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 14,
    },

    // User info card
    userInfoCard: {
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    userInfoGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 20,
    },
    userInfoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    userIconContainer: {
        marginRight: 16,
    },
    userIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfoContent: {
        flex: 1,
    },

    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 8,
    },
    roleDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    storeId: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },

    // Menu styles
    menuContainer: {
        marginBottom: 20,
    },
    menuTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    menuOptionContainer: {
        marginBottom: 12,
    },
    menuOption: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    menuOptionGradient: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 16,
    },
    menuOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuOptionText: {
        flex: 1,
    },
    menuOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    menuOptionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '400',
    },

    // Bottom spacing
    bottomSpacing: {
        height: 20,
    },
});