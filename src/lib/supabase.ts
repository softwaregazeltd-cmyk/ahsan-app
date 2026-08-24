import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import "react-native-url-polyfill/auto";

const extra = Constants.expoConfig?.extra as {
  supabaseUrl: string;
  supabaseAnonKey: string;
};

if (!extra?.supabaseUrl) {
  throw new Error("Missing supabaseUrl in app.json > expo > extra");
}

export const supabase = createClient(extra.supabaseUrl, extra.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});