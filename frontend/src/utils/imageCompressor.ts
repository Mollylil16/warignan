/**
 * Compresse et redimensionne une image côté client avant de l'uploader.
 * Réduit la taille des fichiers de 5-10 Mo (photos de smartphones) à moins de 1 Mo.
 */
export function compressImage(
  file: File,
  maxW = 1920,
  maxH = 1920,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file); // Les fichiers non-images ne sont pas modifiés
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcul des nouvelles dimensions proportionnelles
        if (width > maxW || height > maxH) {
          if (width > height) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            // Conserver le même nom mais forcer le format JPEG compressé
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
