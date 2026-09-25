import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Panel, Screen, ScreenHeader } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { useAuth } from '@/lib/auth';
import { getAttendanceHistory, getTeacherEventAttendance, type AttendanceRecord, type TeacherEventAttendance } from '@/lib/attendance';
import { getProfile } from '@/lib/profiles';
import type { Role } from '@/lib/profiles';
import { RADIUS, SPACING } from '@/constants/colors';

export default function HistoryScreen() {
  const { user } = useAuth();
  const colors = usePresetColors();
  const [role, setRole] = useState<Role | null>(null);
  const [studentRecords, setStudentRecords] = useState<AttendanceRecord[]>([]);
  const [teacherEvents, setTeacherEvents] = useState<TeacherEventAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const profile = await getProfile(user.id);
    const currentRole = profile?.role ?? 'student';
    setRole(currentRole);

    if (currentRole === 'teacher') {
      setTeacherEvents(await getTeacherEventAttendance(user.id));
      setStudentRecords([]);
    } else {
      setStudentRecords(await getAttendanceHistory(user.id));
      setTeacherEvents([]);
    }
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen>
      <ScreenHeader
        code="LOGS / ATTENDANCE"
        title={role === 'teacher' ? 'Event attendance' : 'Scan history'}
        subtitle={
          role === 'teacher'
            ? 'Attendance recorded for events you created.'
            : 'Every event check-in stored on this account.'
        }
      />

      {loading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : role === 'teacher' ? (
        <FlatList
          data={teacherEvents}
          keyExtractor={(event) => event.eventId}
          contentContainerStyle={teacherEvents.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <TeacherEventCard event={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No events created yet"
              subtitle="Create your first event from the Teacher tab to get started."
            />
          }
        />
      ) : (
        <FlatList
          data={studentRecords}
          keyExtractor={(record) => String(record.id)}
          contentContainerStyle={studentRecords.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <StudentRecordCard record={item} />}
          ListEmptyComponent={
            <EmptyState
              title="No attendance scans yet"
              subtitle="Scan a QR code from the Scan tab to record your first attendance."
            />
          }
        />
      )}
    </Screen>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  const colors = usePresetColors();

  return (
    <Panel tone="sunken" style={styles.emptyState}>
      <View style={[styles.emptyMarker, { backgroundColor: colors.primary }]} />
      <ThemedText variant="heading" weight="semibold" color="primary" style={styles.emptyTitle}>
        {title}
      </ThemedText>
      <ThemedText variant="body" color="tertiary" style={styles.emptySubtitle}>
        {subtitle}
      </ThemedText>
    </Panel>
  );
}

function TeacherEventCard({ event }: { event: TeacherEventAttendance }) {
  const colors = usePresetColors();

  return (
    <Panel bar>
      <View style={styles.eventHeader}>
        <View style={styles.eventHeading}>
          <ThemedText variant="heading" weight="extrabold" color="primary" style={styles.eventTitle}>
            {event.title}
          </ThemedText>
          <ThemedText variant="code" color="tertiary">
            {event.eventCode}
          </ThemedText>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primaryLight }]}>
          <ThemedText variant="heading" weight="extrabold" color="primary">
            {event.attendeeCount}
          </ThemedText>
          <ThemedText variant="caption" weight="semibold" color="secondary">
            attended
          </ThemedText>
        </View>
      </View>

      <View style={[styles.metaRow, { backgroundColor: colors.surfaceSunken }]}>
        <ThemedText variant="caption" color="tertiary">
          Starts: {event.startTime ? new Date(event.startTime).toLocaleString() : 'Not set'}
        </ThemedText>
      </View>

      {event.attendees.length === 0 ? (
        <ThemedText variant="body" color="tertiary" style={styles.noAttendees}>
          No students have scanned this event yet.
        </ThemedText>
      ) : (
        <View style={[styles.attendeeList, { borderTopColor: colors.border }]}>
          {event.attendees.map((attendee) => (
            <View
              key={`${event.eventId}-${attendee.studentId}-${attendee.scannedAt}`}
              style={[styles.attendeeRow, { borderBottomColor: colors.border }]}
            >
              <ThemedText variant="body" weight="semibold" color="primary" style={styles.attendeeName}>
                {attendee.studentName || shortId(attendee.studentId)}
              </ThemedText>
              <ThemedText variant="caption" color="tertiary">
                {new Date(attendee.scannedAt).toLocaleString()}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Panel>
  );
}

function StudentRecordCard({ record }: { record: AttendanceRecord }) {
  const colors = usePresetColors();

  return (
    <Panel>
      <View style={styles.recordRow}>
        <View style={[styles.recordIcon, { backgroundColor: colors.successLight }]}>
          <ThemedText variant="heading" weight="extrabold" color="success">
            ✓
          </ThemedText>
        </View>
        <View style={styles.recordDetails}>
          <ThemedText variant="body" weight="bold" color="primary" numberOfLines={1}>
            {record.eventTitle}
          </ThemedText>
          <ThemedText variant="code" color="tertiary" numberOfLines={1}>
            {record.eventId}
          </ThemedText>
          <ThemedText variant="caption" color="tertiary">
            {new Date(record.scannedAt).toLocaleString()}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: colors.successLight }]}>
          <ThemedText variant="caption" weight="semibold" color="success">
            Recorded
          </ThemedText>
        </View>
      </View>
    </Panel>
  );
}

function shortId(id: string) {
  return id ? `…${id.slice(-8)}` : 'unknown';
}

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyMarker: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 21,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  eventHeading: {
    flex: 1,
    gap: SPACING.xs,
  },
  eventTitle: {
    flexShrink: 1,
  },
  countBadge: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minWidth: 76,
  },
  metaRow: {
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  attendeeList: {
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  attendeeName: {
    flexShrink: 1,
  },
  noAttendees: {
    lineHeight: 21,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordDetails: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  statusBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs,
  },
});
