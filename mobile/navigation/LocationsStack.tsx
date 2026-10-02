import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import colors from '@iambox/design-tokens/colors.json';
import { Button } from '../components/ui';
import { LocationsContent } from '../features/locations/LocationsContent';
import { LocationDetail } from '../features/locations/LocationDetail';
import { mockLocations } from '../mocks/locations';

export type LocationsStackParamList = {
  LocationsMap: undefined;
  LocationDetail: { locationId: string };
};

const Stack = createNativeStackNavigator<LocationsStackParamList>();
type Props = { onBack: () => void };
type MapProps = NativeStackScreenProps<LocationsStackParamList, 'LocationsMap'> & Props;
type DetailProps = NativeStackScreenProps<LocationsStackParamList, 'LocationDetail'>;

function LocationsMapScreen({ navigation, onBack }: MapProps) {
  const isFocused = useIsFocused();
  return (
    <LocationsContent
      isFocused={isFocused}
      onBack={onBack}
      onSelectLocation={(location) => navigation.navigate('LocationDetail', { locationId: location.id })}
    />
  );
}

function LocationDetailScreen({ navigation, route }: DetailProps) {
  const location = mockLocations.find((item) => item.id === route.params.locationId);
  const goBack = () => navigation.goBack();

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-surface px-6">
        <Text accessibilityRole="header" className="text-size-18 font-bold text-heading">지점을 찾을 수 없어요.</Text>
        <Button variant="link" label="지도로 돌아가기" onPress={goBack} />
      </View>
    );
  }

  return <LocationDetail location={location} onBack={goBack} />;
}

/** Native screen history lives above the map; map/filter/sheet state stays mounted. */
export function LocationsStack({ onBack }: Props) {
  return (
    <Stack.Navigator
      initialRouteName="LocationsMap"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        fullScreenGestureEnabled: false,
        freezeOnBlur: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="LocationsMap">
        {(props) => <LocationsMapScreen {...props} onBack={onBack} />}
      </Stack.Screen>
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
    </Stack.Navigator>
  );
}
