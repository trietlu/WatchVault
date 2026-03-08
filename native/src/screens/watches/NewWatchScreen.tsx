import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import Screen from '../../components/Screen';
import { useWatchStore } from '../../stores/useWatchStore';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/tokens';
import type { Watch } from '../../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'NewWatch'>;

export default function NewWatchScreen({ navigation }: Props) {
  const addWatch = useWatchStore((state) => state.addWatch);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!brand || !model || !serialNumber) {
      setError('Brand, model, and serial number are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('brand', brand);
      formData.append('model', model);
      formData.append('serialNumber', serialNumber);

      if (imageUri) {
        formData.append(
          'image',
          {
            uri: imageUri,
            name: 'watch.jpg',
            type: 'image/jpeg',
          } as any
        );
      }

      const res = await api.post('/watches', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addWatch(res.data.watch as Watch);
      navigation.replace('Dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create watch.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Mint New Watch</Text>
        <Text style={styles.subtitle}>
          Create a blockchain-secured digital passport.
        </Text>

        <TextInput
          value={brand}
          onChangeText={setBrand}
          placeholder="Brand"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
        />
        <TextInput
          value={model}
          onChangeText={setModel}
          placeholder="Model"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
        />
        <TextInput
          value={serialNumber}
          onChangeText={setSerialNumber}
          placeholder="Serial Number"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoComplete="off"
          autoCorrect={false}
          textContentType="none"
          importantForAutofill="no"
          autoCapitalize="characters"
        />

        <SecondaryButton label="Choose Image (Optional)" onPress={pickImage} />

        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Mint Digital Passport"
          onPress={handleSubmit}
          loading={loading}
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
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  previewWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    width: '100%',
    height: 220,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '500',
  },
});
