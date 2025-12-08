import { useThemeColor } from '@/hooks/useThemeColor';
import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';

export type ThemedViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, children, edges, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <SafeAreaView edges={edges ?? ['top', 'bottom']} style={[{ backgroundColor }, style]} {...otherProps}>
      {children}
    </SafeAreaView>
  );
}
