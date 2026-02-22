import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a file to Firebase Storage and return the download URL.
 * Files are stored under hoardings/{ownerId}/{timestamp}_{filename}
 * Includes a timeout to prevent hanging if Storage isn't enabled.
 */
export async function uploadHoardingImage(
    file: File,
    ownerId: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `hoardings/${ownerId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        // Timeout after 15 seconds if no progress is made
        let lastProgress = -1;
        const timeoutId = setTimeout(() => {
            if (lastProgress < 1) {
                uploadTask.cancel();
                reject(new Error('STORAGE_NOT_ENABLED'));
            }
        }, 15000);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                lastProgress = progress;
                onProgress?.(progress);
                // If we got progress past 0, storage is working — extend timeout
                if (progress > 0) {
                    clearTimeout(timeoutId);
                }
            },
            (error) => {
                clearTimeout(timeoutId);
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                clearTimeout(timeoutId);
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Converts an image File to a Base64 string for direct Firestore storage.
 * Note: Firestore documents have a 1MB limit.
 */
export async function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
