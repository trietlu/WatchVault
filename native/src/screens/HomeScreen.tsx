import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [publicId, setPublicId] = useState('');

  const handleOpenPassport = () => {
    const trimmed = publicId.trim();
    if (!trimmed) {
      return;
    }
    navigation.navigate('PublicPassport', { publicId: trimmed });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.eyebrow}>WATCHVAULT</Text>
        <Text style={styles.title}>Digital Passports for Luxury Watches</Text>
        <Text style={styles.description}>
          Preserve provenance with secure ownership history, service events, and
          optional blockchain anchoring.
        </Text>
        <PrimaryButton
          label="Create Account"
          onPress={() => navigation.navigate('Register')}
        />
        <SecondaryButton
          label="Sign In"
          onPress={() => navigation.navigate('Login')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Verify Public Passport</Text>
        <TextInput
          value={publicId}
          onChangeText={setPublicId}
          placeholder="Enter public passport ID"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoCapitalize="none"
        />
        <PrimaryButton label="Open Passport" onPress={handleOpenPassport} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.text,
  },
  description: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
});
