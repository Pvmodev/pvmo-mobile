import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && !isLoading) {
            const timer = setTimeout(() => {
                if (isAuthenticated) {
                    router.replace('/dashboard');
                } else {
                    router.replace('/login');
                }
            }, 100); // Pequeno delay para garantir que o layout foi montado

            return () => clearTimeout(timer);
        }
    }, [isMounted, isLoading, isAuthenticated, router]);

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

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.logoBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="business" size={40} color="white" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>PVMO Mobile</Text>
                    <Text style={styles.subtitle}>Gerencie sua loja com facilidade</Text>
                </View>

                {/* Loading */}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Secure • Reliable • Fast
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
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

    // Logo section
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontWeight: '300',
    },

    // Loading
    loadingContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        fontWeight: '400',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '300',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});