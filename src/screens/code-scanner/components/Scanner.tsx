import { CameraView, useCameraPermissions } from 'expo-camera';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Linking, StyleSheet, Text, View, ViewProps } from 'react-native';

type Props = {
  readonly cameraProps?: object;
  readonly codeTypes?: string[];
  readonly onCodeRead?: (code: string) => void;
} & ViewProps;

const DEFAULT_CODE_TYPES = ['code-128', 'ean-13', 'ean-8', 'qr'];

function MyScanner({
  cameraProps,
  children,
  codeTypes = DEFAULT_CODE_TYPES,
  onCodeRead,
  style,
  ...props
}: Props) {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const lastScannedCode = useRef<string>('');

  const debouncedCodeRead = useCallback(
    (code: string) => {
      if (code !== lastScannedCode.current) {
        lastScannedCode.current = code;
        onCodeRead?.(code);
      }
    },
    [onCodeRead],
  );

  const handleCodeRead = useMemo(
    () => debounce(debouncedCodeRead, 500, { leading: true, trailing: false }),
    [debouncedCodeRead],
  );

  useEffect(() => {
    if (!hasPermission) {
      void requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleRequestPermission = useCallback(async () => {
    try {
      const result = await requestPermission();
      if (!result) {
        await Linking.openSettings();
      }
    } catch {
      // Handle error silently
    }
  }, [requestPermission]);

  const handleBarcodeScanned = useCallback(
    ({ data, type }: { data: string; type: string }) => {
      if (codeTypes.includes(type)) {
        handleCodeRead(data);
      }
    },
    [codeTypes, handleCodeRead],
  );

  if (!hasPermission) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.permissionContainer]}>
        <Text style={styles.text}>
          Camera permission is required to scan codes. Press
          <Text onPress={handleRequestPermission} style={styles.link}>
            here
          </Text>
          to grant permission.
        </Text>
      </View>
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, style]} {...props}>
      <CameraView
        {...cameraProps}
        onBarcodeScanned={handleBarcodeScanned}
        ratio="16:9"
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

export default MyScanner;

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    maxWidth: 250,
    textAlign: 'center',
  },
});
