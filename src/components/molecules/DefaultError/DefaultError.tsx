import { useErrorBoundary } from 'react-error-boundary';
import { TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '@/components/ui/text';
import { IconByVariant } from '@/components/atoms';

type Properties = {
  readonly onReset?: () => void;
};

function DefaultErrorScreen({ onReset = undefined }: Properties) {
  const { colors, fonts, gutters, layout } = useTheme();
  const { resetBoundary } = useErrorBoundary();

  return (
    <View
      style={[
        layout.flex_1,
        layout.justifyCenter,
        layout.itemsCenter,
        gutters.gap_16,
        gutters.padding_16,
      ]}
    >
      <IconByVariant height={42} path="fire" stroke={colors.error} width={42} />
      <Text style={[fonts.gray800, fonts.bold, fonts.size_16]}>
        Oops! Something went wrong.
      </Text>
      <Text style={[fonts.gray800, fonts.size_12, fonts.alignCenter]}>
        We are sorry for the inconvenience. Please try again later.
      </Text>

      {onReset ? (
        <TouchableOpacity
          onPress={() => {
            resetBoundary();
            onReset();
          }}
        >
          <Text style={[fonts.gray800, fonts.size_16]}>Reload the screen</Text>
        </TouchableOpacity>
      ) : undefined}
    </View>
  );
}

export default DefaultErrorScreen;
