import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../lib/api';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { useAuthStore } from '../stores/useAuthStore';
import { useWatchStore } from '../stores/useWatchStore';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { watches, loading, setWatches, setLoading } = useWatchStore();

  const fetchWatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/watches');
      setWatches(res.data);
    } catch (error) {
      console.error('Failed to fetch watches', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setWatches]);

  useFocusEffect(
    useCallback(() => {
      fetchWatches();
    }, [fetchWatches])
  );

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Collection</Text>
        <Text style={styles.subtitle}>{user?.name ?? user?.email ?? 'Collector'}</Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.grow}>
          <PrimaryButton
            label="Add Watch"
            onPress={() => navigation.navigate('NewWatch')}
          />
        </View>
        <View style={styles.logout}>
          <SecondaryButton label="Logout" onPress={logout} />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={watches}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Card>
              <Text style={styles.emptyTitle}>No watches yet</Text>
              <Text style={styles.emptyBody}>
                Add your first watch to create a digital passport.
              </Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                navigation.navigate('WatchDetail', { watchId: String(item.id) })
              }
            >
              <Card>
                <Text style={styles.cardTitle}>{item.brand}</Text>
                <Text style={styles.cardSubtitle}>{item.model}</Text>
                <Text style={styles.hashLabel}>Serial Hash</Text>
                <Text numberOfLines={1} style={styles.hashValue}>
                  {item.serialNumberHash}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 14,
    gap: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  grow: {
    flex: 1,
  },
  logout: {
    width: 120,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    gap: 10,
    paddingBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyBody: {
    color: colors.mutedText,
    fontSize: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 16,
    color: colors.mutedText,
  },
  hashLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  hashValue: {
    fontFamily: 'Courier',
    color: colors.text,
    fontSize: 13,
  },
});
