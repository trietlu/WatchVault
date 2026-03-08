import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../lib/api';
import Card from '../components/Card';
import Screen from '../components/Screen';
import type { PublicPassport } from '../types/models';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'PublicPassport'>;

export default function PublicPassportScreen({ route }: Props) {
  const { publicId } = route.params;
  const [passport, setPassport] = useState<PublicPassport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/passports/${publicId}`);
        setPassport(res.data);
      } catch (error) {
        console.error('Failed to fetch passport', error);
        setPassport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPassport();
  }, [publicId]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!passport) {
    return (
      <Screen>
        <Card>
          <Text style={styles.errorTitle}>Passport not found</Text>
          <Text style={styles.errorBody}>
            Verify the public ID and try again.
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>WatchVault Passport</Text>
        <Text style={styles.brand}>{passport.brand}</Text>
        <Text style={styles.model}>{passport.model}</Text>
        <Text style={styles.label}>Serial Hash</Text>
        <Text style={styles.value}>{passport.serialNumberHash}</Text>
        <Text style={styles.label}>Passport ID</Text>
        <Text style={styles.value}>{passport.publicId}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Provenance Timeline</Text>
        {passport.events.length === 0 ? (
          <Text style={styles.muted}>No events recorded.</Text>
        ) : (
          passport.events.map((event, index) => (
            <View key={`${event.eventType}-${index}`} style={styles.event}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventType}>{event.eventType}</Text>
                <Text style={styles.eventDate}>
                  {new Date(event.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.eventMeta}>Payload: {event.payloadHash}</Text>
              <Text
                style={[
                  styles.eventStatus,
                  event.txHash ? styles.anchored : styles.pending,
                ]}
              >
                {event.txHash ? 'Anchored' : 'Pending'}
              </Text>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  errorBody: {
    color: colors.mutedText,
    fontSize: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  model: {
    fontSize: 17,
    color: colors.mutedText,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: colors.text,
  },
  section: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  muted: {
    color: colors.mutedText,
  },
  event: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  eventDate: {
    fontSize: 12,
    color: colors.mutedText,
  },
  eventMeta: {
    color: colors.mutedText,
    fontSize: 12,
  },
  eventStatus: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  anchored: {
    color: colors.success,
  },
  pending: {
    color: '#a17a00',
  },
});
