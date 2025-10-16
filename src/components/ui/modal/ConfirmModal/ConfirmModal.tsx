import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';
import { config } from '@/theme/_config';

import { Button } from '../../button';
import { Text } from '../../text';

export type ConfirmBottomSheetReference = {
  close: () => void;
  show: (parameters: ConfirmBottomSheetParameters) => void;
};

type ConfirmBottomSheetParameters = {
  cancelText?: string;
  confirmText?: string;
  description: string;
  onConfirm?: () => void;
  title: string;
};

const ConfirmBottomSheet = forwardRef<ConfirmBottomSheetReference>(
  (_, reference) => {
    const { colors } = useTheme();
    const bottomSheetReference = useRef<BottomSheetModal>(null);

    const [parameters, setParameters] = useState<ConfirmBottomSheetParameters>({
      description: '',
      title: '',
    });

    useImperativeHandle(reference, () => ({
      close: () => {
        bottomSheetReference.current?.dismiss();
      },
      show: (_parameters) => {
        setParameters(_parameters);
        bottomSheetReference.current?.present();
      },
    }));

    const handleConfirm = useCallback(() => {
      bottomSheetReference.current?.dismiss();
      parameters.onConfirm?.();
    }, [parameters]);

    const BackdropComponent = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    return (
      <BottomSheetModal
        backdropComponent={BackdropComponent}
        backgroundStyle={[
          styles.sheetContainer,
          { backgroundColor: colors.gray50 },
        ]}
        index={0}
        ref={bottomSheetReference}
      >
        <BottomSheetView style={{ height: 300 }}>
          <View style={styles.content}>
            <Text style={styles.title}>{parameters.title}</Text>
            <Text style={styles.description}>{parameters.description}</Text>

            <View style={{ flexDirection: 'column', gap: 8 }}>
              <Button
                onPress={() => bottomSheetReference.current?.dismiss()}
                type="primary"
              >
                <Text style={styles.cancelText}>
                  {parameters.cancelText ?? 'Quay lại'}
                </Text>
              </Button>

              <Button onPress={handleConfirm} type="secondary">
                <Text style={styles.confirmText}>
                  {parameters.confirmText ?? 'Đồng ý'}
                </Text>
              </Button>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

ConfirmBottomSheet.displayName = 'ConfirmBottomSheet';

export default ConfirmBottomSheet;

const styles = StyleSheet.create({
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmText: {
    color: config.colors.error,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});
