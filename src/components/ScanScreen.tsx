import { CameraView, useCameraPermissions } from 'expo-camera';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import { Screen, Panel } from '@/components/ui/screen-shell';
import { usePresetColors } from '@/context/ThemeContext';
import { useAuth } from '@/lib/auth';
import { registerAttendance } from '@/lib/attendance';
import { RADIUS, SPACING, mix } from '@/constants/colors';

const ON_CAMERA = '#EEF4FF';
const ON_CAMERA_DIM = 'rgba(238, 244, 255, 0.72)';
const ON_CAMERA_FAINT = 'rgba(238, 244, 255, 0.55)';
const CAMERA_SUCCESS = '#3DD68C';
const CAMERA_DANGER = '#FF6B72';
const GLASS = 'rgba(9, 13, 19, 0.92)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.14)';
const GLASS_CHIP = 'rgba(255, 255, 255, 0.1)';

export default function ScanScreen() {
  const { user } = useAuth();
  const colors = usePresetColors();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cameraAccent = mix(colors.accent, '#FFFFFF', 0.45);
  const bottomPad = Platform.OS === 'ios' ? insets.bottom : 0;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Screen style={styles.permissionScreen}>
          <Panel bar>
            <View style={[styles.permissionIcon, { backgroundColor: colors.surfaceSunken, borderColor: colors.border }]}>
              <SymbolView
                name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                tintColor={colors.primary}
                size={34}
              />
            </View>
            <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
              Camera permission needed
            </Text>
            <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
              Allow camera access to scan an event QR code and record attendance.
            </Text>
            <AppButton
              variant="primary"
              size="lg"
              icon="camera"
              title="Grant permission"
              onPress={requestPermission}
            />
          </Panel>
        </Screen>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setLastData(data);
    registerAttendance(data, user?.id ?? 'unknown')
      .then((result) => {
        setMessage(result.message);
        setSuccess(result.success);
      })
      .catch(() => {
        setMessage('Could not connect to attendance service. Try again.');
        setSuccess(false);
      });
  };

  const handleScanAgain = () => {
    setScanned(false);
    setLastData(null);
    setMessage(null);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View pointerEvents="none" style={styles.topFade}>
        <View style={[styles.band, { height: 64 + insets.top, backgroundColor: 'rgba(6, 9, 14, 0.88)' }]} />
        <View style={[styles.band, { height: 40, backgroundColor: 'rgba(6, 9, 14, 0.55)' }]} />
        <View style={[styles.band, { height: 34, backgroundColor: 'rgba(6, 9, 14, 0.3)' }]} />
        <View style={[styles.band, { height: 28, backgroundColor: 'rgba(6, 9, 14, 0.12)' }]} />
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.glassBadge}>
          <View style={[styles.dot, { backgroundColor: scanned ? CAMERA_SUCCESS : cameraAccent }]} />
          <Text style={styles.badgeText}>{scanned ? 'CAPTURED' : 'LIVE'}</Text>
        </View>
        <View style={styles.glassBadge}>
          <Text style={styles.badgeText}>QR / EVENT CHECK-IN</Text>
        </View>
      </View>

      <View style={styles.stage} pointerEvents="none">
        <View style={[styles.reticle, { borderColor: 'rgba(255, 255, 255, 0.3)' }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: cameraAccent }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: cameraAccent }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: cameraAccent }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: cameraAccent }]} />
          {!scanned && <View style={[styles.scanLine, { backgroundColor: cameraAccent }]} />}
        </View>
        <Text style={styles.stageLabel}>
          {scanned ? 'QR CODE DETECTED' : 'ALIGN THE QR INSIDE THE FRAME'}
        </Text>
      </View>

      <View style={[styles.bottomFade, { height: 56 }]}>
        <View style={[styles.band, { height: 20, backgroundColor: 'rgba(6, 9, 14, 0.18)' }]} />
        <View style={[styles.band, { height: 18, backgroundColor: 'rgba(6, 9, 14, 0.42)' }]} />
        <View style={[styles.band, { flex: 1, backgroundColor: 'rgba(6, 9, 14, 0.7)' }]} />
      </View>

      <View style={[styles.sheet, { paddingBottom: SPACING.lg + bottomPad }]}>
        <View style={[styles.grabber, { backgroundColor: GLASS_BORDER }]} />

        <Text style={styles.sheetTitle}>
          {scanned ? 'QR code detected' : 'Scan an event QR code'}
        </Text>
        <Text style={styles.sheetBody}>Point your camera at the event check-in code.</Text>

        {scanned && message ? (
          <View style={[styles.resultChip, { borderColor: success ? CAMERA_SUCCESS : CAMERA_DANGER }]}>
            <View style={[styles.dot, { backgroundColor: success ? CAMERA_SUCCESS : CAMERA_DANGER }]} />
            <Text style={[styles.resultText, { color: success ? CAMERA_SUCCESS : CAMERA_DANGER }]}>
              {message}
            </Text>
          </View>
        ) : null}

        {scanned && lastData ? (
          <Text style={styles.payload} numberOfLines={2}>
            {lastData}
          </Text>
        ) : null}

        {scanned ? (
          <AppButton
            variant="primary"
            size="md"
            icon="refresh"
            title="Scan again"
            onPress={handleScanAgain}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070B',
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
  },
  permissionIcon: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  permissionBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  band: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: 'rgba(9, 13, 19, 0.72)',
    maxWidth: '100%',
  },
  badgeText: {
    color: ON_CAMERA,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  reticle: {
    width: 232,
    height: 232,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(6, 9, 14, 0.12)',
  },
  corner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: 'transparent',
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: RADIUS.lg,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: RADIUS.lg,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: RADIUS.lg,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: RADIUS.lg,
  },
  scanLine: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: '50%',
    height: 2,
    borderRadius: 2,
    opacity: 0.9,
  },
  stageLabel: {
    color: ON_CAMERA_DIM,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
  bottomFade: {
    flexDirection: 'column',
  },
  sheet: {
    backgroundColor: GLASS,
    borderTopWidth: 1,
    borderTopColor: GLASS_BORDER,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  grabber: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.xs,
  },
  sheetTitle: {
    color: ON_CAMERA,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  sheetBody: {
    color: ON_CAMERA_DIM,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: SPACING.xs,
  },
  resultChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    backgroundColor: GLASS_CHIP,
    padding: SPACING.sm + 4,
    marginTop: SPACING.xs,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  payload: {
    color: ON_CAMERA_FAINT,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    backgroundColor: GLASS_CHIP,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    overflow: 'hidden',
  },
});
