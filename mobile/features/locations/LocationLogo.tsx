import { StyleSheet, View } from 'react-native';
import LogoSymbol from '../../assets/iambox-logo-symbol.svg';
import colors from '@iambox/design-tokens/colors.json';

export function LocationLogo() {
  return (
    <View collapsable={false} accessible={false} style={styles.container}>
      <LogoSymbol width={25.2} height={28} accessible={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 28,
    height: 31,
    borderRadius: 5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
