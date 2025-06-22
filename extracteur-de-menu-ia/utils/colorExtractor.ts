
import type { ExtractedColors } from '../types';

// ColorThief is loaded via CDN and will be available on the window object.
// The types.ts file includes a global declaration for window.ColorThief.

const toHex = (rgb: number[]): string => `#${rgb.map(x => {
  const hex = x.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}).join('')}`;

export const extractColorsFromImage = (imageElement: HTMLImageElement): Promise<ExtractedColors> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.ColorThief) {
        reject(new Error("La bibliothèque ColorThief n'est pas chargée."));
        return;
      }
      const colorThief = new window.ColorThief();
      
      // Ensure image is loaded, though the caller should ideally do this
      if (!imageElement.complete || imageElement.naturalHeight === 0) {
        // If image not fully loaded, wait for it
        imageElement.addEventListener('load', () => {
          try {
            const dominantColor = colorThief.getColor(imageElement);
            const palette = colorThief.getPalette(imageElement, 5); // Get 5 palette colors
            resolve({
              dominant: toHex(dominantColor),
              palette: palette.map((p: number[]) => toHex(p)),
            });
          } catch (e) {
            reject(e);
          }
        });
        imageElement.addEventListener('error', (e) => reject(new Error("Erreur de chargement de l'image pour ColorThief.")));
        // If src is already set and it failed, the error might have already fired.
        // If src is data URL, it should load almost instantly.
      } else {
         // Image already loaded
        const dominantColor = colorThief.getColor(imageElement);
        const palette = colorThief.getPalette(imageElement, 5);
        resolve({
          dominant: toHex(dominantColor),
          palette: palette.map((p: number[]) => toHex(p)),
        });
      }
    } catch (error) {
      console.error("Erreur ColorThief:", error);
      reject(error);
    }
  });
};
