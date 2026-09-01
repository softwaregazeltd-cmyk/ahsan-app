import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./supabase";

/**
 * Opens the photo library, uploads the chosen image to the `uploads` bucket,
 * and returns its public URL (or null if cancelled).
 */
export async function pickAndUploadImage(folder = "misc"): Promise<string | null> {
  // 1. permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error("Photo permission is required.");

  // 2. pick
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    base64: true,
  });
  if (res.canceled || !res.assets?.length) return null;

  const asset = res.assets[0];
  const base64 = asset.base64 ?? (await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 }));

  // 3. upload
  const ext = (asset.uri.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("uploads")
    .upload(path, decode(base64), { contentType: `image/${ext === "jpg" ? "jpeg" : ext}`, upsert: false });
  if (error) throw error;

  // 4. public URL
  const { data } = supabase.storage.from("uploads").getPublicUrl(path);
  return data.publicUrl;
}