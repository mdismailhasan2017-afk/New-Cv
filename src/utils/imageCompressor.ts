/**
 * Utility functions for compressing images and managing localStorage quota.
 * Prevents "QuotaExceededError" when saving history and CV data.
 */

/**
 * Compress an uploaded photo for CV display (optimal 360x450px portrait, JPEG 0.82)
 * Keeps output size typically between 25KB and 45KB instead of 3MB - 6MB.
 */
export function compressImageForCVPhoto(
  source: File | Blob | string,
  maxWidth = 360,
  maxHeight = 460,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(typeof source === 'string' ? source : '');
            return;
          }

          // Crisp image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(typeof source === 'string' ? source : '');
        }
      };

      img.onerror = () => {
        resolve(typeof source === 'string' ? source : '');
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => resolve('');
        reader.readAsDataURL(source);
      }
    } catch {
      resolve(typeof source === 'string' ? source : '');
    }
  });
}

/**
 * Generate a tiny micro-thumbnail (max 70x90 px, ~2-4 KB) for history snapshots.
 * If size exceeds 12KB, returns undefined to save localStorage quota.
 */
export function createMicroThumbnail(
  source: File | Blob | string,
  maxDim = 80,
  quality = 0.35
): Promise<string | undefined> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(undefined);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const thumb = canvas.toDataURL('image/jpeg', quality);
          // Only keep if under 12KB
          if (thumb.length <= 12000) {
            resolve(thumb);
          } else {
            resolve(undefined);
          }
        } catch {
          resolve(undefined);
        }
      };

      img.onerror = () => resolve(undefined);

      if (typeof source === 'string') {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(source);
      }
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Automatically inspects and purges bloated or oversize data in localStorage
 * to ensure the app never crashes with "The quota has been exceeded".
 */
export function cleanExcessiveLocalStorageQuota(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const PASSPORT_KEY = 'pro_cv_passport_scan_history_v1';
    const CV_HISTORY_KEY = 'pro_cv_history_snapshots_v1';

    // 1. Clean passport history items with heavy thumbnails
    const rawPassport = localStorage.getItem(PASSPORT_KEY);
    if (rawPassport) {
      try {
        const items = JSON.parse(rawPassport);
        if (Array.isArray(items)) {
          let modified = false;
          const cleaned = items.slice(0, 25).map((item, idx) => {
            // Only keep thumbnail on very newest item if < 10KB; strip from others
            if (item.imageThumbnail && (idx > 0 || item.imageThumbnail.length > 10000)) {
              modified = true;
              const { imageThumbnail, ...rest } = item;
              return rest;
            }
            return item;
          });
          if (modified || items.length > 25) {
            localStorage.setItem(PASSPORT_KEY, JSON.stringify(cleaned));
          }
        }
      } catch (err) {
        console.warn('Recovering passport history cache:', err);
      }
    }

    // 2. Clean CV history snapshots with heavy photos in older versions
    const rawCv = localStorage.getItem(CV_HISTORY_KEY);
    if (rawCv) {
      try {
        const cvItems = JSON.parse(rawCv);
        if (Array.isArray(cvItems)) {
          let modified = false;
          const cleanedCv = cvItems.slice(0, 15).map((item, idx) => {
            // Strip large photo from historical snapshots (keep on newest if small)
            if (idx > 0 && item?.data?.photoUrl && item.data.photoUrl.length > 20000) {
              modified = true;
              return {
                ...item,
                data: {
                  ...item.data,
                  photoUrl: '',
                },
              };
            }
            return item;
          });
          if (modified || cvItems.length > 15) {
            localStorage.setItem(CV_HISTORY_KEY, JSON.stringify(cleanedCv));
          }
        }
      } catch (err) {
        console.warn('Recovering CV history cache:', err);
      }
    }
  } catch (err) {
    console.warn('Quota sanitation error:', err);
  }
}
