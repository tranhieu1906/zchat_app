import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

type Props = {
  readonly children: React.ReactNode;
  readonly waitBeforeShow?: number;
};

function Delayed({ children, waitBeforeShow = 500 }: Props) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true);
    }, waitBeforeShow);
    return () => {
      clearTimeout(timer);
    };
  }, [waitBeforeShow]);

  return isShown ? (
    children
  ) : (
    <View
      style={{
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator />
    </View>
  );
}

export default Delayed;
