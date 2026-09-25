import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import QRCode from 'react-native-qrcode-svg';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Panel, Screen, ScreenHeader, ScreenScroll } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { useAuth } from '@/lib/auth';
import { createEvent, type Event } from '@/lib/events';
import { getProfile } from '@/lib/profiles';
import type { Role } from '@/lib/profiles';
import { buildQRPayload } from '@/lib/qr';
import { FONT_SIZES, RADIUS, SPACING } from '@/constants/colors';
import AppButton from '@/components/AppButton';

function toUTCISO(date: Date) {
  return date.toISOString();
}

function formatDateTime(date: Date) {
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TeacherScreen() {
  const { user } = useAuth();
  const colors = usePresetColors();
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [eventId, setEventId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date());
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 60 * 60 * 1000));
  const [editTarget, setEditTarget] = useState<'start' | 'end' | null>(null);
  const [editingPart, setEditingPart] = useState<'date' | 'time'>('date');
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!user) {
        setRoleLoading(false);
        return () => { active = false; };
      }

      setRoleLoading(true);
      void getProfile(user.id).then((profile) => {
        if (!active) return;
        setRole(profile?.role ?? 'student');
        setRoleLoading(false);
      });

      return () => { active = false; };
    }, [user]),
  );

  const openPicker = (target: 'start' | 'end') => {
    setEditTarget(target);
    setEditingPart('date');
  };

  const onPickerChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed' || !selectedDate || !editTarget) {
      setEditTarget(null);
      return;
    }

    if (Platform.OS === 'android' && editingPart === 'date') {
      if (editTarget === 'start') setStartDate(selectedDate);
      else setEndDate(selectedDate);
      setEditingPart('time');
      return;
    }

    if (editTarget === 'start') setStartDate(selectedDate);
    else setEndDate(selectedDate);
    setEditTarget(null);
  };

  const setEndOffset = (minutes: number) => {
    setEndDate(new Date(startDate.getTime() + minutes * 60 * 1000));
  };

  const handleCreateEvent = async () => {
    const event: Event = {
      eventId: eventId.trim(),
      title: title.trim(),
      start: toUTCISO(startDate),
      end: toUTCISO(endDate),
    };

    if (!event.eventId || !event.title) {
      setMessage('All fields are required.');
      setPayload(null);
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setMessage('Start time must be before end time.');
      setPayload(null);
      return;
    }

    try {
      const result = await createEvent(event);
      if (result.error) {
        setMessage(result.error);
        setPayload(null);
        return;
      }
      setMessage('Event saved! Scan the QR with the Scan tab to test it.');
      setPayload(buildQRPayload(event));
    } catch {
      setMessage('Could not save the event. Please try again.');
      setPayload(null);
    }
  };

  if (roleLoading) {
    return (
      <Screen style={styles.centerScreen}>
        <View style={styles.loaderBlock}>
          <SymbolView
            name={{ ios: 'hourglass', android: 'hourglass_top', web: 'hourglass_top' }}
            tintColor={colors.primary}
            size={32}
          />
          <ThemedText variant="heading" weight="bold" color="secondary">
            Checking your account...
          </ThemedText>
        </View>
      </Screen>
    );
  }

  if (role !== 'teacher') {
    return (
      <Screen style={styles.centerScreen}>
        <Panel style={styles.lockPanel}>
          <View style={[styles.lockIcon, { backgroundColor: colors.primaryLight }]}>
            <SymbolView
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              tintColor={colors.primary}
              size={26}
            />
          </View>
          <ThemedText variant="subtitle" weight="extrabold" color="primary" style={styles.centerText}>
            Teachers Only
          </ThemedText>
          <ThemedText variant="body" color="secondary" style={styles.centerText}>
            Only teacher accounts can create events and issue attendance QR codes.
          </ThemedText>
        </Panel>
      </Screen>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={styles.scrollContent}>
      <ScreenHeader
        code="TEACHER / EVENTS"
        title="Create attendance QR"
        subtitle="Set the event details, save it, then display the QR for students."
      />

      <Panel bar style={styles.block}>
        <View style={styles.form}>
          <Field label="Event title" value={title} onChangeText={setTitle} placeholder="Calculus lecture" />
          <Field label="Event code" value={eventId} onChangeText={setEventId} placeholder="CALC-2026-001" />
          <PickerField label="Starts" value={formatDateTime(startDate)} onPress={() => openPicker('start')} />
          <PickerField label="Ends" value={formatDateTime(endDate)} onPress={() => openPicker('end')} />
          <View style={styles.chipRow}>
            {[30, 60, 120].map((minutes) => (
              <Pressable
                key={minutes}
                onPress={() => setEndOffset(minutes)}
                style={({ pressed }) => [
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.surfaceSunken },
                  pressed && { opacity: 0.7, borderColor: colors.borderStrong },
                ]}
              >
                <ThemedText variant="caption" weight="bold" color="primary">
                  +{minutes === 60 ? '1 hour' : `${minutes} min`}
                </ThemedText>
              </Pressable>
            ))}
            <View style={styles.chipSpacer} />
            <ThemedText variant="caption" color="tertiary">
              sets the end time
            </ThemedText>
          </View>
        </View>
      </Panel>

      {editTarget && (
        <DateTimePicker
          value={editTarget === 'start' ? startDate : endDate}
          mode={Platform.OS === 'android' ? editingPart : 'datetime'}
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={onPickerChange}
        />
      )}

      <AppButton
        variant="primary"
        size="lg"
        fullWidth
        icon="create"
        title="Create event"
        onPress={handleCreateEvent}
      />

      {message && (
        <View
          style={[
            styles.messageBanner,
            {
              backgroundColor: message.includes('saved') ? colors.successLight : colors.dangerLight,
              borderColor: message.includes('saved') ? colors.success : colors.danger,
            },
          ]}
        >
          <SymbolView
            name={
              message.includes('saved')
                ? { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
                : { ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }
            }
            tintColor={message.includes('saved') ? colors.success : colors.danger}
            size={18}
          />
          <ThemedText
            variant="body"
            weight="medium"
            color={message.includes('saved') ? 'success' : 'danger'}
            style={styles.bannerText}
          >
            {message}
          </ThemedText>
        </View>
      )}

      {payload && (
        <Panel style={styles.resultPanel}>
          <View style={styles.resultHead}>
            <ThemedText variant="overline" weight="extrabold" color="secondary">
              OUTPUT / QR PAYLOAD
            </ThemedText>
            <ThemedText variant="heading" weight="bold" color="primary" style={styles.centerText}>
              Scan this QR with the Scan tab
            </ThemedText>
          </View>

          <View style={[styles.qrBox, { borderColor: colors.border }]}>
            <QRCode value={payload} size={230} />
          </View>

          <View style={[styles.hintRow, { backgroundColor: colors.surfaceSunken }]}>
            <SymbolView
              name={{ ios: 'eye.fill', android: 'visibility', web: 'visibility' }}
              tintColor={colors.textTertiary}
              size={14}
            />
            <ThemedText variant="caption" color="tertiary">
              Keep the white panel unobstructed so scanners can read the code.
            </ThemedText>
          </View>

          <ThemedText variant="code" color="tertiary" style={styles.payloadText} numberOfLines={4}>
            {payload}
          </ThemedText>
        </Panel>
      )}
    </ScreenScroll>
  );
}

function Field({ label, value, onChangeText, placeholder }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string }) {
  const colors = usePresetColors();
  return (
    <View style={styles.field}>
      <ThemedText variant="overline" weight="extrabold" color="secondary">{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        style={[
          styles.input,
          { backgroundColor: colors.surfaceSunken, borderColor: colors.border, color: colors.textPrimary },
        ]}
      />
    </View>
  );
}

function PickerField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const colors = usePresetColors();
  return (
    <View style={styles.field}>
      <ThemedText variant="overline" weight="extrabold" color="secondary">{label}</ThemedText>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.pickerField,
          {
            backgroundColor: colors.surfaceSunken,
            borderColor: pressed ? colors.borderStrong : colors.border,
          },
        ]}
      >
        <ThemedText variant="body" color="primary" style={styles.pickerValue}>{value}</ThemedText>
        <SymbolView
          name={{ ios: 'calendar', android: 'event', web: 'event' }}
          tintColor={colors.textTertiary}
          size={16}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  centerScreen: {
    justifyContent: 'center',
  },
  loaderBlock: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  lockPanel: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  lockIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  block: {
    marginBottom: SPACING.md,
  },
  form: {
    gap: SPACING.lg,
  },
  field: {
    gap: SPACING.xs,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  pickerField: {
    minHeight: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  pickerValue: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
  },
  chipSpacer: {
    flex: 1,
    minWidth: 8,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
  },
  bannerText: {
    flex: 1,
  },
  resultPanel: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  resultHead: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignSelf: 'stretch',
  },
  payloadText: {
    textAlign: 'center',
    maxWidth: '100%',
  },
});
