import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import { useGoogleAuth } from '../../lib/useGoogleAuth';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import Screen from '../../components/Screen';
import { useAuthStore } from '../../stores/useAuthStore';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((state) => state.login);
  const {
    googleError,
    googleLoading,
    googleDisabled,
    signInWithGoogle,
    clearGoogleError,
  } = useGoogleAuth(login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    clearGoogleError();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Image
          source={require('../../../assets/watchvault-logo-v2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Access your collection</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.mutedText}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.mutedText}
          secureTextEntry
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
          style={styles.input}
        />

        {error || googleError ? (
          <Text style={styles.error}>{error || googleError}</Text>
        ) : null}

        <PrimaryButton label="Sign In" onPress={handleSubmit} loading={loading} />
        <SecondaryButton
          label={googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          onPress={() => {
            void signInWithGoogle();
          }}
          disabled={loading || googleDisabled}
        />
        <SecondaryButton
          label="Create Account"
          onPress={() => navigation.navigate('Register')}
          disabled={loading || googleLoading}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.mutedText,
    marginBottom: 6,
  },
  logo: {
    width: '100%',
    height: 52,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
