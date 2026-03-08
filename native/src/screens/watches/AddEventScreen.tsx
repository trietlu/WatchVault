import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../../lib/api';
import { getErrorMessage } from '../../lib/errors';
import Card from '../../components/Card';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import type { RootStackParamList } from '../../types/navigation';
import { colors } from '../../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEvent'>;

const eventTypeOptions = ['SERVICE', 'AUTH', 'TRANSFER', 'NOTE'] as const;

export default function AddEventScreen({ route, navigation }: Props) {
  const watchId = Number(route.params.watchId);
  const [eventType, setEventType] = useState<(typeof eventTypeOptions)[number]>(
    'SERVICE'
  );
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description || !date) {
      setError('Description and date are required.');
      return;
    }

    setLoading(true);
    setError('');
    const payload = {
      description,
      location,
      date,
      recordedBy: 'Owner',
    };

    try {
      await api.post(`/watches/${watchId}/events`, {
        eventType,
        payload,
      });
      navigation.replace('WatchDetail', { watchId: String(watchId) });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to record event.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Record Event</Text>
        <Text style={styles.subtitle}>Add a lifecycle event to this watch.</Text>

        <View style={styles.options}>
          {eventTypeOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setEventType(option)}
              style={[
                styles.option,
                eventType === option && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionLabel,
                  eventType === option && styles.optionLabelSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          multiline
        />
        <TextInput
          value={location}
          onChangeText={setLocation}
          placeholder="Location / Provider"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
        />
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          autoCapitalize="none"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Record Event"
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
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eceff1',
  },
  optionLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: colors.primary,
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
