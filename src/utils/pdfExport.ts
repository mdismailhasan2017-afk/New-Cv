import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { CVPaperSize } from '../types';

/**
 * Detect current paper size from the DOM wrapper classes.
 */
export function detectCurrentPaperSize(): CVPaperSize {
  if (typeof document === 'undefined') return 'a4';
  const wrapper = document.querySelector('.cv-pages-wrapper');
  if (wrapper?.classList.contains('cv-paper-letter')) return 'letter';
  if (wrapper?.classList.contains('cv-paper-legal')) return 'legal';
  return 'a4';
}

/**
 * Sets 300 DPI resolution metadata into the JPEG binary header (JFIF APP0 segment).
 * This guarantees that when the downloaded JPG is opened in Windows Photo Viewer,
 * Microsoft Word, Photoshop, or commercial printers, it registers exactly 300 DPI
 * and physical print dimensions of:
 * - A4: 8.27" × 11.69" (210 × 297 mm)
 */
function setJpegDpi(uint8Array: Uint8Array, dpi: number = 300): Uint8Array {
  // Check SOI marker (0xFF, 0xD8)
  if (uint8Array[0] !== 0xFF || uint8Array[1] !== 0xD8) return uint8Array;

  // Check if APP0 marker (0xFF, 0xE0) exists at offset 2
  if (uint8Array[2] === 0xFF && uint8Array[3] === 0xE0) {
    // Verify "JFIF\0" identifier (4A 46 49 46 00)
    if (
      uint8Array[6] === 0x4A &&
      uint8Array[7] === 0x46 &&
      uint8Array[8] === 0x49 &&
      uint8Array[9] === 0x46 &&
      uint8Array[10] === 0x00
    ) {
      uint8Array[13] = 1; // 1 = dots per inch (DPI)
      uint8Array[14] = (dpi >> 8) & 0xFF; // Xdensity high byte
      uint8Array[15] = dpi & 0xFF;        // Xdensity low byte
      uint8Array[16] = (dpi >> 8) & 0xFF; // Ydensity high byte
      uint8Array[17] = dpi & 0xFF;        // Ydensity low byte
      return uint8Array;
    }
  }

  // If no standard JFIF APP0 is present, inject an 18-byte JFIF header
  const app0 = new Uint8Array([
    0xFF, 0xE0, // APP0 marker
    0x00, 0x10, // length = 16 bytes
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x02, // version 1.2
    0x01,       // units: 1 = dots per inch (DPI)
    (dpi >> 8) & 0xFF, dpi & 0xFF, // Xdensity
    (dpi >> 8) & 0xFF, dpi & 0xFF, // Ydensity
    0x00, 0x00  // no thumbnail
  ]);

  const result = new Uint8Array(uint8Array.length + app0.length);
  result.set(uint8Array.subarray(0, 2), 0); // SOI (FF D8)
  result.set(app0, 2);                      // Insert APP0
  result.set(uint8Array.subarray(2), 2 + app0.length); // Remainder of JPEG
  return result;
}

/**
 * Ensures all web fonts are fully loaded before capturing DOM.
 */
async function ensureFontsLoaded(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
      await Promise.allSettled([
        document.fonts.load('14px "Tinos"'),
        document.fonts.load('14px "Times New Roman"'),
        document.fonts.load('14px "Arimo"'),
        document.fonts.load('14px "Plus Jakarta Sans"'),
        document.fonts.load('14px "Hind Siliguri"'),
        document.fonts.load('14px "Noto Sans Bengali"'),
        document.fonts.load('14px "EB Garamond"'),
      ]);
      await document.fonts.ready;
      // Brief pause to allow the browser layout engine to stabilize
      await new Promise((resolve) => setTimeout(resolve, 120));
    } catch (e) {
      console.warn('Font preload warning:', e);
    }
  }
}

/**
 * Prepares the cloned document for pixel-perfect font rendering:
 * - Strips all CSS zoom and transform matrices from ancestors
 * - Disables font ligatures (prevents letter overlap glitches)
 * - Enforces crisp geometric text rendering
 */
function applyClonedDocFontFixes(clonedDoc: Document): void {
  // Inject explicit CSS rules to prevent font rendering bugs
  const styleTag = clonedDoc.createElement('style');
  styleTag.textContent = `
    * {
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: geometricPrecision !important;
      font-feature-settings: "liga" 0, "calt" 0 !important;
      letter-spacing: normal !important;
    }
    .preview-panel,
    .preview-zoom-wrapper {
      transform: none !important;
      zoom: 1 !important;
      padding: 0 !important;
      margin: 0 !important;
    }
    .print-hide,
    .no-print {
      display: none !important;
    }
    .a4-paper-container {
      transform: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      border: none !important;
      box-sizing: border-box !important;
    }
  `;
  clonedDoc.head.appendChild(styleTag);

  // Traverse and remove any inline transform or zoom applied on elements
  const elementsWithTransform = clonedDoc.querySelectorAll<HTMLElement>('*');
  elementsWithTransform.forEach((el) => {
    if (el.style.transform && el.style.transform !== 'none') {
      el.style.transform = 'none';
    }
    if (el.style.zoom && el.style.zoom !== '1' && el.style.zoom !== 'normal') {
      el.style.zoom = '1';
    }
  });

  // Ensure body and html in cloned document have no offsets
  clonedDoc.body.style.transform = 'none';
  clonedDoc.body.style.zoom = '1';
  clonedDoc.body.style.margin = '0';
  clonedDoc.body.style.padding = '0';
  clonedDoc.documentElement.style.transform = 'none';
  clonedDoc.documentElement.style.zoom = '1';
}

/**
 * High-quality client-side PDF export using html2canvas & jsPDF.
 * Uses integer scaling and lossless PNG representation to ensure crystal-clear text.
 */
export async function exportCVToPDF(
  filename: string = 'CV_Resume.pdf',
  onProgress?: (message: string) => void,
  paperSize?: CVPaperSize
): Promise<void> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-paper-container'));
  
  if (!pageElements || pageElements.length === 0) {
    throw new Error('সিভির কোনো A4 পেজ পাওয়া যায়নি');
  }

  onProgress?.('ফন্ট ও পেজ প্রসেস করা হচ্ছে...');
  await ensureFontsLoaded();

  onProgress?.(`PDF প্রস্তুত করা হচ্ছে (মোট ${pageElements.length}টি পেজ)...`);

  const paper = paperSize || detectCurrentPaperSize();
  let format: string = 'a4';
  let pageWidth = 210;
  let pageHeight = 297;

  if (paper === 'letter') {
    format = 'letter';
    pageWidth = 215.9;
    pageHeight = 279.4;
  } else if (paper === 'legal') {
    format = 'legal';
    pageWidth = 215.9;
    pageHeight = 355.6;
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format as any,
    compress: true,
  });

  for (let i = 0; i < pageElements.length; i++) {
    onProgress?.(`পৃষ্ঠা ${i + 1}/${pageElements.length} রেন্ডার হচ্ছে...`);
    const el = pageElements[i];

    // Using integer scale (2) prevents fractional subpixel blur and character distortion
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        applyClonedDocFontFixes(clonedDoc);
      },
    });

    // Lossless PNG eliminates DCT compression noise around font outlines
    const imgData = canvas.toDataURL('image/png');

    if (i > 0) {
      pdf.addPage(format as any, 'portrait');
    }

    const imgWidth = pageWidth;
    const canvasRatio = canvas.height / canvas.width;
    let imgHeight = imgWidth * canvasRatio;

    // If within 6mm of standard page height, snap to pageHeight to prevent vertical stretch
    if (Math.abs(imgHeight - pageHeight) <= 6) {
      imgHeight = pageHeight;
    }

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
  }

  onProgress?.('PDF ফাইল সেভ হচ্ছে...');
  const safeName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(safeName);
}

/**
 * Export CV pages as High-Resolution JPG image files in exact A4 (8.27" × 11.69" • 210 × 297 mm)
 * dimensions (2480 × 3508 pixels at 300 DPI) with embedded JFIF 300 DPI headers.
 */
export async function exportCVToJPG(
  candidateName: string = 'Candidate',
  pageIndex?: number,
  onProgress?: (message: string) => void,
  paperSize?: CVPaperSize
): Promise<void> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-paper-container'));

  if (!pageElements || pageElements.length === 0) {
    throw new Error('সিভির কোনো A4 পেজ পাওয়া যায়নি');
  }

  onProgress?.('ফন্ট ও পেজ প্রসেস করা হচ্ছে...');
  await ensureFontsLoaded();

  const cleanName = candidateName.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'Resume';
  const paper = paperSize || detectCurrentPaperSize();

  // Standard 300 DPI print pixel dimensions
  // A4: 8.267" × 11.693" -> 2480 × 3508 pixels at 300 DPI
  let targetWidth = 2480;
  let targetHeight = 3508;
  let paperLabel = 'A4';

  if (paper === 'letter') {
    targetWidth = 2550;
    targetHeight = 3300;
    paperLabel = 'Letter';
  } else if (paper === 'legal') {
    targetWidth = 2550;
    targetHeight = 4200;
    paperLabel = 'Legal';
  }

  const renderPageToExactJpgBlob = async (el: HTMLElement, pageNum: number, total: number): Promise<Blob> => {
    onProgress?.(`পৃষ্ঠা ${pageNum}/${total}: A4 (${targetWidth} × ${targetHeight} px, 300 DPI) রেন্ডার হচ্ছে...`);

    // Capture element with html2canvas at scale: 2.8 for razor-sharp typography
    const rawCanvas = await html2canvas(el, {
      scale: 2.8,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        applyClonedDocFontFixes(clonedDoc);
      },
    });

    // Create an exact 300 DPI canvas (A4: 2480 x 3508 px)
    const exactCanvas = document.createElement('canvas');
    exactCanvas.width = targetWidth;
    exactCanvas.height = targetHeight;
    const ctx = exactCanvas.getContext('2d', { alpha: false });

    if (!ctx) {
      throw new Error('ক্যানভাস রেন্ডারিং কনটেক্সট তৈরি করতে সমস্যা হয়েছে');
    }

    // Fill with clean white sheet background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate source ratio and scale onto exact A4 sheet
    const rawWidth = rawCanvas.width;
    const rawHeight = rawCanvas.height;
    const rawRatio = rawWidth / rawHeight;
    const targetRatio = targetWidth / targetHeight;

    // If within 5% of target aspect ratio, stretch to 100% full bleed A4
    if (Math.abs(rawRatio - targetRatio) < 0.05) {
      ctx.drawImage(rawCanvas, 0, 0, rawWidth, rawHeight, 0, 0, targetWidth, targetHeight);
    } else {
      let drawW = targetWidth;
      let drawH = targetHeight;
      let offX = 0;
      let offY = 0;

      if (rawRatio > targetRatio) {
        drawH = targetWidth / rawRatio;
        offY = Math.max(0, (targetHeight - drawH) / 2);
      } else {
        drawW = targetHeight * rawRatio;
        offX = Math.max(0, (targetWidth - drawW) / 2);
      }
      ctx.drawImage(rawCanvas, 0, 0, rawWidth, rawHeight, offX, offY, drawW, drawH);
    }

    // Convert to JPEG with 0.96 quality
    const rawBlob = await new Promise<Blob | null>((resolve) => {
      exactCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.96);
    });

    if (!rawBlob) {
      throw new Error('JPG ইমেজ তৈরি করা যায়নি');
    }

    // Inject 300 DPI metadata in the JPEG binary header
    const buffer = await rawBlob.arrayBuffer();
    const dpiAdjustedBytes = setJpegDpi(new Uint8Array(buffer), 300);

    return new Blob([dpiAdjustedBytes], { type: 'image/jpeg' });
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 2500);
  };

  if (pageIndex !== undefined) {
    const targetEl = pageElements[pageIndex];
    if (!targetEl) throw new Error(`পেজ ${pageIndex + 1} পাওয়া যায়নি`);
    const blob = await renderPageToExactJpgBlob(targetEl, pageIndex + 1, pageElements.length);
    const filename = `${cleanName}_CV_Page_${pageIndex + 1}_${paperLabel}_300DPI.jpg`;
    triggerDownload(blob, filename);
    onProgress?.(`পেজ ${pageIndex + 1} A4 (300 DPI) JPG ডাউনলোড সফল হয়েছে!`);
  } else {
    // Export all pages
    for (let i = 0; i < pageElements.length; i++) {
      const blob = await renderPageToExactJpgBlob(pageElements[i], i + 1, pageElements.length);
      const filename = pageElements.length === 1
        ? `${cleanName}_CV_${paperLabel}_300DPI.jpg`
        : `${cleanName}_CV_Page_${i + 1}_${paperLabel}_300DPI.jpg`;
      triggerDownload(blob, filename);

      if (i < pageElements.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    onProgress?.(`সবগুলো পেজ A4 (${paperLabel} 300 DPI) JPG হিসেবে ডাউনলোড সম্পন্ন হয়েছে!`);
  }
}

/**
 * Open CV in an isolated printable window to bypass iframe printing blocks.
 * Produces 100% Vector text when printed or saved as PDF via browser dialog.
 */
export function openPrintWindow(): void {
  const pages = document.querySelectorAll<HTMLElement>('.a4-paper-container');
  if (!pages || pages.length === 0) {
    window.print();
    return;
  }

  // Find active font and spacing classes from wrapper
  const wrapper = document.querySelector('.cv-pages-wrapper');
  const wrapperClasses = wrapper ? wrapper.className : 'cv-pages-wrapper cv-font-times cv-spacing-normal';

  // Collect all stylesheets from current document
  let styles = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    styles += node.outerHTML;
  });

  // Collect pages HTML
  let pagesHtml = '';
  pages.forEach((p) => {
    pagesHtml += p.outerHTML;
  });

  const printWindow = window.open('', '_blank', 'width=950,height=1050');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>Print CV - Pro CV Builder</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Arimo:ital,wght@0,400..700;1,400..700&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Cinzel:wght@500;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
      ${styles}
      <style>
        @page { size: A4 portrait; margin: 0; }
        body { margin: 0; padding: 0; background: #ffffff !important; }
        .cv-pages-wrapper {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }
        .a4-paper-container {
          box-shadow: none !important;
          margin: 0 auto !important;
          page-break-after: always !important;
          break-after: page !important;
        }
        .a4-paper-container:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      </style>
    </head>
    <body>
      <div class="${wrapperClasses}">
        ${pagesHtml}
      </div>
      <script>
        window.onload = function() {
          if (document.fonts) {
            document.fonts.ready.then(function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 350);
            }).catch(function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            });
          } else {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 500);
          }
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
