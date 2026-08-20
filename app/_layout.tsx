import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";

export default function RootLayout() {
  const [loaded] = useFonts({
    Jakarta: PlusJakartaSans_700Bold,
    JakartaBold: PlusJakartaSans_800ExtraBold,
    Inter: Inter_400Regular,
    InterSemi: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  if (!loaded) return null; // brief blank while fonts load

  return <Stack screenOptions={{ headerShown: false }} />;
}