import { supabase } from '../config/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export const pickImage = async (aspect: [number, number] = [4, 3]): Promise<string | null> => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Üzgünüz, bu özelliği kullanmak için galeri iznine ihtiyacımız var.');
            return null;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: aspect,
            quality: 0.7,
            base64: true, // Request base64 for Supabase upload
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            // Return both uri and base64 if needed, but for now just uri is fine for display
            // For upload we might need base64 or blob.
            // Let's attach base64 to the asset uri or return the whole asset?
            // Existing code expects string uri.
            // We can re-read base64 in uploadImage or pass it here.
            // Let's keep it simple and read blob in uploadImage like before, 
            // BUT React Native fetch blob might be tricky with Supabase.
            // Supabase recommends ArrayBuffer or FormData.
            // Let's try FormData first as it's standard.
            // Actually, for React Native, base64 arraybuffer is often most reliable.
            return result.assets[0].uri;
        }

        return null;
    } catch (error) {
        console.error('Pick image error:', error);
        return null;
    }
};

export const uploadImage = async (uri: string, path: string): Promise<string> => {
    try {
        // We need to read the file as base64 or blob.
        // Since we didn't return base64 from pickImage (to keep signature same),
        // we can use fetch to get blob, then convert to arrayBuffer.

        const response = await fetch(uri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const { data, error } = await supabase.storage
            .from('images') // Ensure this bucket exists in Supabase
            .upload(path, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: true,
            });

        if (error) {
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(path);

        return publicUrl;
    } catch (error) {
        console.error('Upload image error:', error);
        throw error;
    }
};

export const getBlobCheck = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
}

