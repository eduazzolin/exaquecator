/**
 * Utilitários para processamento e compressão ultra-leve de imagens no cliente.
 * Projetado especificamente para evitar picos de memória RAM em dispositivos móveis (Android/iOS).
 */

export interface ProcessedImageResult {
  base64: string;
  blob: Blob;
  sizeKb: number;
  width: number;
  height: number;
}

/**
 * Redimensiona e comprime uma imagem para dimensões ideais de diário clínico (~800px max, ~40-70KB),
 * utilizando decodificação nativa com createImageBitmap ou ObjectURL para não saturar a memória do dispositivo.
 */
export const compressImageDetails = async (
  file: File,
  maxDimension: number = 800,
  quality: number = 0.70
): Promise<ProcessedImageResult> => {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida.');
  }

  // 1. Criar ObjectURL temporário (zero-copy pointer, sem inflar base64 na memória)
  const objectUrl = URL.createObjectURL(file);

  try {
    // 2. Obter dimensões originais da imagem
    const { origWidth, origHeight } = await new Promise<{ origWidth: number; origHeight: number }>(
      (resolve, reject) => {
        const tempImg = new Image();
        tempImg.onload = () => {
          resolve({
            origWidth: tempImg.naturalWidth || tempImg.width,
            origHeight: tempImg.naturalHeight || tempImg.height
          });
        };
        tempImg.onerror = () => reject(new Error('Não foi possível ler as dimensões da imagem.'));
        tempImg.src = objectUrl;
      }
    );

    // 3. Calcular novas dimensões mantendo aspect ratio
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.max(1, Math.round((targetHeight * maxDimension) / targetWidth));
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.max(1, Math.round((targetWidth * maxDimension) / targetHeight));
        targetHeight = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('Não foi possível obter contexto 2D para a imagem.');
    }

    // 4. Decodificação otimizada: priorizar createImageBitmap com redimensionamento nativo
    let bitmapDrawn = false;
    if ('createImageBitmap' in window) {
      try {
        const bitmap = await createImageBitmap(file, {
          resizeWidth: targetWidth,
          resizeHeight: targetHeight,
          resizeQuality: 'medium'
        });
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close(); // Libera imediatamente memória de hardware
        bitmapDrawn = true;
      } catch {
        bitmapDrawn = false;
      }
    }

    // Fallback se createImageBitmap não estiver disponível ou falhar
    if (!bitmapDrawn) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          resolve();
        };
        img.onerror = () => reject(new Error('Falha ao renderizar imagem no canvas.'));
        img.src = objectUrl;
      });
    }

    // 5. Gerar JPEG otimizado
    const base64 = canvas.toDataURL('image/jpeg', quality);

    // Gerar Blob para uploads futuros no Cloud Storage
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
    });

    const sizeKb = Math.round((blob.size || base64.length * 0.75) / 1024);

    // 6. Limpeza completa do canvas para garbage collection imediato
    canvas.width = 0;
    canvas.height = 0;

    return {
      base64,
      blob,
      sizeKb,
      width: targetWidth,
      height: targetHeight
    };
  } finally {
    // Revoga a URL temporária liberando memória do sistema operacional
    URL.revokeObjectURL(objectUrl);
  }
};

/**
 * Função utilitária mantida para compatibilidade retroativa com código existente.
 * Retorna diretamente a string Base64 otimizada.
 */
export const compressImage = async (
  file: File,
  maxDimension: number = 800,
  quality: number = 0.70
): Promise<string> => {
  const result = await compressImageDetails(file, maxDimension, quality);
  return result.base64;
};
