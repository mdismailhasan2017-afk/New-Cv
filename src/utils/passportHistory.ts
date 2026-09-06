import { PassportScanResult } from './passportScanner';

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_HISTORY));
      localStorage.setItem(TOTAL_SCANS_COUNTER_KEY, '1');
      return DEFAULT_SEEDED_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load passport history:', err);
    return [];
  }
}

/**
 * Save a new scan result to history (limits to latest 50 items)
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

    // Increment lifetime counter
    const currentTotal = getTotalPassportScansCount();
    localStorage.setItem(TOTAL_SCANS_COUNTER_KEY, String(currentTotal + 1));

    // Prevent duplicate entries if scanned within 5 seconds with same passport number
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

    const newItem: PassportHistoryItem = {
      id: `ps_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scannedAt: formattedDate,
      timestamp: Date.now(),
      title: `${name} (${passNo !== 'N/A' ? `পাসপোর্ট: ${passNo}` : 'স্ক্যান ডাটা'})`,
      data: { ...scanResult },
      imageThumbnail: imageThumbnail && imageThumbnail.length < 300000 ? imageThumbnail : undefined,
      source: scanResult.source || 'gemini-ai',
    };

    // Keep most recent first, max 50 items
    const updated = [newItem, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch global event for live counter update
    window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));

    return updated;
  } catch (err) {
    console.error('Failed to save passport history:', err);
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
