import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import api from '../../lib/api';
import { buildPublicPassportUrl, getApiAssetUrl } from '../../lib/config';
import { getErrorMessage } from '../../lib/errors';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import Screen from '../../components/Screen';
import { useWatchStore } from '../../stores/useWatchStore';
import type { Watch } from '../../types/models';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'WatchDetail'>;

export default function WatchDetailScreen({ route, navigation }: Props) {
  const watchId = Number(route.params.watchId);
  const setSelectedWatch = useWatchStore((state) => state.setSelectedWatch);
  const updateWatch = useWatchStore((state) => state.updateWatch);
  const [watch, setWatch] = useState<Watch | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchWatch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/watches/${watchId}`);
      setWatch(res.data);
      setSelectedWatch(res.data);
      updateWatch(watchId, res.data);
    } catch (error) {
      console.error('Failed to fetch watch detail', error);
    } finally {
      setLoading(false);
    }
  }, [setSelectedWatch, updateWatch, watchId]);

  useEffect(() => {
    fetchWatch();
  }, [fetchWatch]);

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append(
        'image',
        {
          uri: result.assets[0].uri,
          name: 'watch.jpg',
          type: 'image/jpeg',
        } as any
      );
      await api.post(`/watches/${watchId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchWatch();
    } catch (error: unknown) {
      Alert.alert('Upload failed', getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (fileId: number) => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/watches/${watchId}/images/${fileId}`);
            await fetchWatch();
          } catch (error: unknown) {
            Alert.alert('Delete failed', getErrorMessage(error));
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!watch) {
    return (
      <Screen>
        <Card>
          <Text style={styles.notFound}>Watch not found.</Text>
        </Card>
      </Screen>
    );
  }

  const image = watch.files?.[0];
  const publicUrl = buildPublicPassportUrl(watch.publicId);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{watch.brand}</Text>
        <Text style={styles.subtitle}>{watch.model}</Text>
        <Text style={styles.hashLabel}>Serial Hash</Text>
        <Text style={styles.hashValue}>{watch.serialNumberHash}</Text>
        <Text style={styles.hashLabel}>Public ID</Text>
        <Text style={styles.hashValue}>{watch.publicId}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>Watch Image</Text>
        {image ? (
          <>
            <Image source={{ uri: getApiAssetUrl(image.url) }} style={styles.image} />
            <SecondaryButton
              label="Delete Image"
              onPress={() => deleteImage(image.id)}
              disabled={uploading}
            />
          </>
        ) : (
          <PrimaryButton
            label={uploading ? 'Uploading...' : 'Upload Image'}
            onPress={uploadImage}
            disabled={uploading}
          />
        )}
      </Card>

      <Card>
        <Text style={styles.section}>Public Passport</Text>
        <View style={styles.qrWrap}>
          <QRCode value={publicUrl} size={180} />
        </View>
        <SecondaryButton
          label="Open Public Passport"
          onPress={() => Linking.openURL(publicUrl)}
        />
      </Card>

      <Card>
        <Text style={styles.section}>Timeline</Text>
        {(watch.events ?? []).length === 0 ? (
          <Text style={styles.empty}>No events recorded yet.</Text>
        ) : (
          (watch.events ?? []).map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventType}>{event.eventType}</Text>
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.eventMeta} numberOfLines={1}>
                Hash: {event.payloadHash}
              </Text>
              <Text
                style={[
                  styles.status,
                  event.txHash ? styles.anchored : styles.pending,
                ]}
              >
                {event.txHash ? 'Anchored' : 'Pending'}
              </Text>
            </View>
          ))
        )}
      </Card>

      <PrimaryButton
        label="Add Event"
        onPress={() =>
          navigation.navigate('AddEvent', { watchId: String(watchId) })
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFound: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
  },
  hashLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  hashValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'Courier',
  },
  section: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 10,
  },
  qrWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  empty: {
    color: colors.mutedText,
    fontSize: 15,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  eventTime: {
    color: colors.mutedText,
    fontSize: 13,
  },
  eventMeta: {
    color: colors.mutedText,
    fontSize: 12,
  },
  status: {
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
