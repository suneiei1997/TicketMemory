import * as ImagePicker from 'expo-image-picker';

// Opens the photo library; resolves to an image uri or null if cancelled.
export async function pickImage({ aspect } = {}) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: !!aspect,
    aspect,
    quality: 0.7,
  });
  if (res.canceled || !res.assets?.length) return null;
  return res.assets[0].uri;
}
