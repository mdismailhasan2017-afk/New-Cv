import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

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
    .a4-paper-container {
      transform: none !important;
      box-shadow: none !important;
      margin: 0 !important;
      border: none !important;
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
  onProgress?: (message: string) => void
): Promise<void> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-paper-container'));
  
  if (!pageElements || pageElements.length === 0) {
    throw new Error('সিভির কোনো A4 পেজ পাওয়া যায়নি');
  }

  onProgress?.('ফন্ট ও পেজ প্রসেস করা হচ্ছে...');
  await ensureFontsLoaded();

  onProgress?.(`PDF প্রস্তুত করা হচ্ছে (মোট ${pageElements.length}টি পেজ)...`);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
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
      pdf.addPage('a4', 'portrait');
    }

    // A4 dimensions: 210mm x 297mm
    const imgWidth = 210;
    const pageHeight = 297;
    const canvasRatio = canvas.height / canvas.width;
    let imgHeight = imgWidth * canvasRatio;

    // If within 6mm of standard A4, snap to 297mm to prevent any vertical stretch
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
 * Export CV pages as High-Resolution JPG image files.
 */
export async function exportCVToJPG(
  candidateName: string = 'Candidate',
  pageIndex?: number,
  onProgress?: (message: string) => void
): Promise<void> {
  const pageElements = Array.from(document.querySelectorAll<HTMLElement>('.a4-paper-container'));

  if (!pageElements || pageElements.length === 0) {
    throw new Error('সিভির কোনো A4 পেজ পাওয়া যায়নি');
  }

  onProgress?.('ফন্ট ও পেজ প্রসেস করা হচ্ছে...');
  await ensureFontsLoaded();

  const cleanName = candidateName.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') || 'Resume';

  const downloadCanvasAsJPG = (canvas: HTMLCanvasElement, filename: string) => {
    // 0.98 high-quality JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPage = async (el: HTMLElement, pageNum: number, total: number) => {
    onProgress?.(`পৃষ্ঠা ${pageNum}/${total} হাই-কোয়ালিটি JPG তৈরি হচ্ছে...`);
    return await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        applyClonedDocFontFixes(clonedDoc);
      },
    });
  };

  if (pageIndex !== undefined) {
    const targetEl = pageElements[pageIndex];
    if (!targetEl) throw new Error(`পেজ ${pageIndex + 1} পাওয়া যায়নি`);
    const canvas = await renderPage(targetEl, pageIndex + 1, pageElements.length);
    const filename = `${cleanName}_CV_Page_${pageIndex + 1}.jpg`;
    downloadCanvasAsJPG(canvas, filename);
    onProgress?.(`পেজ ${pageIndex + 1} JPG ডাউনলোড সফল হয়েছে!`);
  } else {
    // Export all pages
    for (let i = 0; i < pageElements.length; i++) {
      const canvas = await renderPage(pageElements[i], i + 1, pageElements.length);
      const filename = pageElements.length === 1 
        ? `${cleanName}_CV.jpg` 
        : `${cleanName}_CV_Page_${i + 1}.jpg`;
      downloadCanvasAsJPG(canvas, filename);

      if (i < pageElements.length - 1) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    onProgress?.('সবগুলো পেজের JPG ডাউনলোড সম্পন্ন হয়েছে!');
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
