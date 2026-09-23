import { PassportScanResult } from './passportScanner';
import { cleanExcessiveLocalStorageQuota } from './imageCompressor';

export interface PassportHistoryItem {
  id: string;
  scannedAt: string; // Formatted date string
  timestamp: number; // Unix timestamp
  title: string;
  data: PassportScanResult;
  imageThumbnail?: string;
  source: 'gemini-ai' | 'local-ocr' | 'text-parser';
}

const STORAGE_KEY = 'pro_cv_passport_scan_history_v1';
const TOTAL_SCANS_COUNTER_KEY = 'pro_cv_total_passports_scanned_count';

const DEFAULT_SEEDED_HISTORY: PassportHistoryItem[] = [
  {
    id: 'seed-alamen-passport',
    scannedAt: new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' (সংরক্ষিত ডাটা)',
    timestamp: Date.now() - 3600000,
    title: 'ALAMEN (পাসপোর্ট: A16474136)',
    source: 'gemini-ai',
    data: {
      passportNumber: 'A16474136',
      fullName: 'ALAMEN',
      dob: '06 APR 2002',
      dateOfIssue: '14 MAR 2024',
      dateOfExpiry: '13 MAR 2029',
      placeOfIssue: 'DHAKA',
      gender: 'MALE',
      nationality: 'BANGLADESHI',
      religion: 'ISLAM',
      maritalStatus: 'UNMARRIED',
      fatherName: 'MD KHORSHED ALOM',
      motherName: 'ANOWARA BEGUM',
      personalNo: '7336048123',
      permanentAddress: 'Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi',
      presentAddress: 'Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi',
      rawText: 'PASSPORT / PASSEPORT\nPEOPLE\'S REPUBLIC OF BANGLADESH\nType: P Country: BGD\nSurname: ALAMEN\nNationality: BANGLADESHI\nPersonal No: 7336048123\nDate of Birth: 06 APR 2002\nSex: M Place of Birth: NARSINGDI\nDate of Issue: 14 MAR 2024\nDate of Expiry: 13 MAR 2029\nAuthority: DIP / DHAKA\nP<BGDALAMEN<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nA164741368BGD0204068M29031357336048123<<<76',
      confidence: 99,
      source: 'gemini-ai',
    },
  },
];

/**
 * Bulletproof multi-stage saver that handles QuotaExceededError automatically.
 */
function safeSavePassportHistory(items: PassportHistoryItem[]): boolean {
  const candidates = items.slice(0, 30);

  // Stage 1: Standard save
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    return true;
  } catch {
    // Quota reached: immediately run sanitation
    cleanExcessiveLocalStorageQuota();
  }

  // Stage 2: Keep thumbnail only on index 0 if small (< 10KB); strip all others
  const stripOldThumbs = candidates.map((item, idx) => {
    if (idx === 0 && item.imageThumbnail && item.imageThumbnail.length <= 10000) {
      return item;
    }
    const { imageThumbnail, ...rest } = item;
    return rest as PassportHistoryItem;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripOldThumbs));
    return true;
  } catch {
    // continue
  }

  // Stage 3: Strip ALL thumbnails completely
  const noThumbs = candidates.map((item) => {
    const { imageThumbnail, ...rest } = item;
    return rest as PassportHistoryItem;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(noThumbs));
    return true;
  } catch {
    // continue
  }

  // Stage 4: Reduce item count (15, 10, 5, 2) and shorten rawText
  for (const count of [15, 10, 5, 2]) {
    try {
      const reduced = noThumbs.slice(0, count).map((item) => ({
        ...item,
        data: {
          ...item.data,
          rawText: item.data.rawText ? item.data.rawText.substring(0, 300) : '',
        },
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      return true;
    } catch {
      // try next smaller count
    }
  }

  return false;
}

/**
 * Get total lifetime scanned passports count
 */
export function getTotalPassportScansCount(): number {
  try {
    const stored = localStorage.getItem(TOTAL_SCANS_COUNTER_KEY);
    if (stored !== null) {
      const num = parseInt(stored, 10);
      if (!isNaN(num)) return num;
    }
    const history = getPassportHistory();
    return history.length;
  } catch {
    return 0;
  }
}

/**
 * Get passport scan statistics
 */
export function getPassportScanStats(): {
  totalScanned: number;
  historyCount: number;
  items: PassportHistoryItem[];
} {
  const items = getPassportHistory();
  const totalScanned = Math.max(getTotalPassportScansCount(), items.length);
  return {
    totalScanned,
    historyCount: items.length,
    items,
  };
}

/**
 * Load all saved passport scan history from localStorage
 */
export function getPassportHistory(): PassportHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time: initialize with default seeded entry
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_HISTORY));
        localStorage.setItem(TOTAL_SCANS_COUNTER_KEY, '1');
      } catch {
        // ignore
      }
      return DEFAULT_SEEDED_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.warn('Failed to load passport history, running quota cleanup:', err);
    try {
      cleanExcessiveLocalStorageQuota();
      const raw2 = localStorage.getItem(STORAGE_KEY);
      if (raw2) {
        const parsed2 = JSON.parse(raw2);
        if (Array.isArray(parsed2)) return parsed2;
      }
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Save a new scan result to history safely without quota errors
 */
export function savePassportScanToHistory(
  scanResult: PassportScanResult,
  imageThumbnail?: string | null
): PassportHistoryItem[] {
  try {
    const current = getPassportHistory();
    const now = new Date();
    const formattedDate = now.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const name = (scanResult.fullName || 'নামহীন প্রার্থী').trim().toUpperCase();
    const passNo = (scanResult.passportNumber || 'N/A').trim().toUpperCase();

    // Increment lifetime counter safely
    try {
      const currentTotal = getTotalPassportScansCount();
      localStorage.setItem(TOTAL_SCANS_COUNTER_KEY, String(currentTotal + 1));
    } catch {
      // ignore counter fail
    }

    // Prevent duplicate entries if scanned within 10 seconds with same passport number
    const isDuplicate = current.some(
      (item) =>
        item.data.passportNumber &&
        item.data.passportNumber.toUpperCase() === passNo &&
        Date.now() - item.timestamp < 10000
    );

    if (isDuplicate) {
      // Dispatch event so UI counters update
      window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));
      return current;
    }

    // Cap thumbnail size to 12KB to protect localStorage quota
    const safeThumbnail =
      imageThumbnail && imageThumbnail.length <= 12000 ? imageThumbnail : undefined;

    // Truncate rawText to avoid huge text dumps
    const safeData: PassportScanResult = {
      ...scanResult,
      rawText: scanResult.rawText ? scanResult.rawText.substring(0, 1000) : '',
    };

    const newItem: PassportHistoryItem = {
      id: `ps_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scannedAt: formattedDate,
      timestamp: Date.now(),
      title: `${name} (${passNo !== 'N/A' ? `পাসপোর্ট: ${passNo}` : 'স্ক্যান ডাটা'})`,
      data: safeData,
      imageThumbnail: safeThumbnail,
      source: scanResult.source || 'gemini-ai',
    };

    // Keep most recent first, max 30 items
    const updated = [newItem, ...current].slice(0, 30);
    safeSavePassportHistory(updated);

    // Dispatch global event for live counter update
    window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));

    return updated;
  } catch (err) {
    console.warn('Handled passport history save exception gracefully:', err);
    return getPassportHistory();
  }
}

/**
 * Delete a specific history item
 */
export function deletePassportHistoryItem(id: string): PassportHistoryItem[] {
  try {
    const current = getPassportHistory();
    const filtered = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete passport history item:', err);
    return getPassportHistory();
  }
}

/**
 * Clear all passport scan history
 */
export function clearAllPassportHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear passport history:', err);
  }
}

/**
 * Generate formatted text summary for copying passport details
 */
export function formatPassportDetailsText(data: PassportScanResult): string {
  const lines: string[] = [];
  lines.push('=== PASSPORT VERIFICATION & CANDIDATE DATA ===');
  if (data.fullName) lines.push(`Full Name: ${data.fullName}`);
  if (data.passportNumber) lines.push(`Passport No: ${data.passportNumber}`);
  if (data.dob) lines.push(`Date of Birth: ${data.dob}`);
  if (data.gender) lines.push(`Gender: ${data.gender}`);
  if (data.nationality) lines.push(`Nationality: ${data.nationality}`);
  if (data.fatherName) lines.push(`Father's Name: ${data.fatherName}`);
  if (data.motherName) lines.push(`Mother's Name: ${data.motherName}`);
  if (data.dateOfIssue) lines.push(`Date of Issue: ${data.dateOfIssue}`);
  if (data.dateOfExpiry) lines.push(`Date of Expiry: ${data.dateOfExpiry}`);
  if (data.placeOfIssue) lines.push(`Place of Issue: ${data.placeOfIssue}`);
  if (data.personalNo) lines.push(`Personal / NID No: ${data.personalNo}`);
  if (data.previousPassportNumber) lines.push(`Previous Passport: ${data.previousPassportNumber}`);
  if (data.religion) lines.push(`Religion: ${data.religion}`);
  if (data.maritalStatus) lines.push(`Marital Status: ${data.maritalStatus}`);
  if (data.permanentAddress) lines.push(`Permanent Address: ${data.permanentAddress}`);
  if (data.presentAddress) lines.push(`Present Address: ${data.presentAddress}`);
  return lines.join('\n');
}
