import samples from './missingCoverSamples.json' with { type: 'json' };

// Compara as duas imagens de indisponibilidade conhecidas, não a cor da capa.
export function matchesMissingCover(pixels) {
  return samples.some(reference => {
    let difference = 0;
    let sumA = 0, sumB = 0, sumAA = 0, sumBB = 0, sumAB = 0;
    for (let i = 0; i < reference.length; i++) {
      const a = pixels[i], b = reference[i];
      difference += Math.abs(a - b);
      sumA += a; sumB += b;
      sumAA += a * a; sumBB += b * b; sumAB += a * b;
    }
    const n = reference.length;
    const denominator = Math.sqrt((n * sumAA - sumA * sumA) * (n * sumBB - sumB * sumB));
    return difference / n <= 12 && denominator > 0
      && (n * sumAB - sumA * sumB) / denominator >= 0.9;
  });
}

export function isMissingCoverImage(image) {
  if (image.naturalWidth === 1 && image.naturalHeight === 1) return true;
  if (!globalThis.document?.createElement || !image.naturalWidth || !image.naturalHeight) return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const scale = Math.max(180 / image.naturalWidth, 260 / image.naturalHeight);
    const left = (image.naturalWidth - 180 / scale) / 2;
    const top = (image.naturalHeight - 260 / scale) / 2;
    context.drawImage(image, left + 14 / scale, top + 65 / scale, 152 / scale, 169 / scale, 0, 0, 24, 32);
    const rgba = context.getImageData(0, 0, 24, 32).data;
    const rgb = [];
    for (let i = 0; i < rgba.length; i += 4) rgb.push(rgba[i], rgba[i + 1], rgba[i + 2]);
    return matchesMissingCover(rgb);
  } catch {
    // URLs que não permitem leitura de pixels continuam usando a validação do servidor.
    return false;
  }
}
