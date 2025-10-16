import { useWindowDimensions } from 'react-native';
import { Defs, Mask, Rect, Svg } from 'react-native-svg';

export const RECT_MASK_TOP_SPACE = 223;
export const RECT_SIZE = 280;

export function ScannerMask() {
  const dimensions = useWindowDimensions();
  return (
    <Svg height="100%" width="100%">
      <Defs>
        <Mask height="100%" id="mask" width="100%" x="0" y="0">
          <Rect fill="#fff" height="100%" width="100%" />
          <Rect
            fill="black"
            height={RECT_SIZE}
            rx={10}
            ry={10}
            width={RECT_SIZE}
            x={(dimensions.width - RECT_SIZE) / 2}
            y={RECT_MASK_TOP_SPACE}
          />
        </Mask>
      </Defs>
      <Rect
        fill="rgba(0, 0, 0, 0.7)"
        fill-opacity="0"
        height="100%"
        mask="url(#mask)"
        width="100%"
      />
    </Svg>
  );
}
