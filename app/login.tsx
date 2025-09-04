import { useAuth } from '@/contexts/AuthContext';
import { localStorage } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberEmail, setRememberEmail] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;
    const logoScale = React.useRef(new Animated.Value(0.8)).current;

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // Load remembered email
        loadRememberedEmail();

        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Keyboard listeners
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
        });

        return () => {
            keyboardDidHideListener?.remove();
            keyboardDidShowListener?.remove();
        };
    }, []);

    const loadRememberedEmail = async () => {
        try {
            const rememberedEmail = await localStorage.getRememberEmail();
            if (rememberedEmail) {
                setEmail(rememberedEmail);
                setRememberEmail(true);
            }
        } catch (error) {
            console.log('Erro ao carregar email salvo:', error);
        }
    };

    const handleLogin = async () => {
        // Dismiss keyboard
        Keyboard.dismiss();

        if (!email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Erro', 'Digite um email válido');
            return;
        }

        setIsLoading(true);
        try {
            await login({ email, password }, rememberEmail);
            // Navigation será feita pelo useEffect quando isAuthenticated mudar
        } catch (error: any) {
            console.error('Erro no login:', error);

            let errorMessage = 'Erro desconhecido';

            if (error.statusCode === 401) {
                errorMessage = 'Email ou senha incorretos';
            } else if (error.statusCode === 0) {
                errorMessage = 'Erro de conexão. Verifique sua internet.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert('Erro no login', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Logo Section */}
                    <Animated.View
                        style={[
                            styles.logoSection,
                            {
                                transform: [{ scale: logoScale }],
                                marginTop: isKeyboardVisible ? -20 : 0,
                            },
                        ]}
                    >
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
                    </Animated.View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        <View style={styles.glassCard}>
                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#667eea" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Senha"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        autoCorrect={false}
                                        editable={!isLoading}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                        disabled={isLoading}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-outline" : "eye-off-outline"}
                                            size={20}
                                            color="rgba(255,255,255,0.6)"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Remember Email Checkbox */}
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberEmail(!rememberEmail)}
                                disabled={isLoading}
                            >
                                <View style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}>
                                    {rememberEmail && (
                                        <Ionicons name="checkmark" size={14} color="white" />
                                    )}
                                </View>
                                <Text style={styles.checkboxText}>Lembrar email</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={isLoading ? ['#999', '#777'] : ['#667eea', '#764ba2']}
                                    style={styles.loginButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.loginButtonText}>Entrando...</Text>
                                        </View>
                                    ) : (
                                        <View style={styles.buttonContent}>
                                            <Text style={styles.loginButtonText}>Entrar</Text>
                                            <Ionicons name="arrow-forward" size={20} color="white" />
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Development Helper */}
                            {__DEV__ && (
                                <TouchableOpacity
                                    style={styles.devButton}
                                    onPress={() => {
                                        setEmail('admin@pvmo.com');
                                        setPassword('senha123');
                                    }}
                                >
                                    <Text style={styles.devButtonText}>
                                        🔧 Dev: Preencher credenciais
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Secure • Reliable • Fast
                        </Text>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
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

    // Form section
    formContainer: {
        marginBottom: 40,
    },
    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 24,
        elevation: 8,
    },

    // Input styles
    inputContainer: {
        marginBottom: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '400',
    },
    eyeIcon: {
        padding: 4,
    },

    // Checkbox
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    checkboxText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },

    // Button styles
    loginButton: {
        marginTop: 8,
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    loginButtonDisabled: {
        shadowOpacity: 0.1,
    },
    loginButtonGradient: {
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
        marginRight: 8,
    },

    // Development helper
    devButton: {
        padding: 12,
        backgroundColor: 'rgba(255, 193, 7, 0.2)',
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    devButtonText: {
        color: '#ffc107',
        fontSize: 12,
        fontWeight: '500',
    },

    // Footer
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: '300',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});