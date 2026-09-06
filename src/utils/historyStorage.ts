import { CVData, CVTemplateId, StyleConfig, CVHistoryItem } from '../types';
import { PRESET_ALAMEN_PASSPORT } from '../data/samplePresets';

const STORAGE_KEY = 'pro_cv_builder_history_v1';
const TOTAL_CVS_COUNTER_KEY = 'pro_cv_total_cvs_made_count';
const MAX_HISTORY_ITEMS = 50;

const DEFAULT_SEEDED_CV_HISTORY: CVHistoryItem[] = [
  {
    id: 'seed-alamen-cv',
    timestamp: Date.now() - 3600000,
    dateFormatted: new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' (সংরক্ষিত ডেমো)',
    title: 'ALAMEN (A16474136) - Overseas Worker',
    candidateName: 'ALAMEN',
    passportNumber: 'A16474136',
    templateId: 'fmt-gulf-1',
    data: JSON.parse(JSON.stringify(PRESET_ALAMEN_PASSPORT)),
    summary: 'পাসপোর্ট: A16474136 • মোবাইল: +880 1700-000000 • অভিজ্ঞতা: ২ বছর • অটো-সেভ হিস্টোরি',
  },
];

/**
 * Get total lifetime created CVs count
 */
export function getTotalCVsCount(): number {
  try {
    const stored = localStorage.getItem(TOTAL_CVS_COUNTER_KEY);
    if (stored !== null) {
      const num = parseInt(stored, 10);
      if (!isNaN(num)) return num;
    }
    const history = getCVHistory();
    return Math.max(1, history.length);
  } catch {
    return 1;
  }
}

/**
 * Get CV history statistics
 */
export function getCVStats(): {
  totalCount: number;
  historyCount: number;
  items: CVHistoryItem[];
  lastUpdated?: string;
} {
  const items = getCVHistory();
  const totalCount = Math.max(getTotalCVsCount(), items.length);
  const lastUpdated = items.length > 0 ? items[0].dateFormatted : undefined;
  return {
    totalCount,
    historyCount: items.length,
    items,
    lastUpdated,
  };
}

/**
 * Get all saved CV history snapshots from localStorage
 */
export function getCVHistory(): CVHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with default seeded entry
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SEEDED_CV_HISTORY));
      localStorage.setItem(TOTAL_CVS_COUNTER_KEY, '1');
      return DEFAULT_SEEDED_CV_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (err) {
    console.error('Failed to load CV history:', err);
    return [];
  }
}

/**
 * Auto-save CV to history:
 * Checks if this candidate already exists in recent history (by passport or name).
 * If yes, updates the existing record with the latest data and timestamp.
 * If no, inserts a brand new history snapshot and increments the total counter.
 */
export function autoSaveCVToHistory(
  data: CVData,
  templateId: CVTemplateId,
  style?: StyleConfig,
  customTitle?: string
): CVHistoryItem | null {
  const candidateName = (data.name || '').trim();
  const passportNumber = (data.passportNumber || '').trim().toUpperCase();

  // Skip auto-saving if candidate name is purely empty or default placeholder with no details
  if (!candidateName || (candidateName === 'YOUR NAME' && !passportNumber && !data.mobile)) {
    return null;
  }

  const current = getCVHistory();
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const title =
    customTitle?.trim() ||
    `${candidateName}${passportNumber ? ` (${passportNumber})` : ''} - ${data.jobTitle || 'CV'}`;

  const summary = [
    passportNumber ? `পাসপোর্ট: ${passportNumber}` : null,
    data.mobile ? `মোবাইল: ${data.mobile}` : null,
    data.experiences?.length ? `অভিজ্ঞতা: ${data.experiences.length}টি` : null,
    data.educations?.length ? `শিক্ষা: ${data.educations.length}টি` : null,
  ].filter(Boolean).join(' • ');

  // Look for matching candidate in history to update or upsert
  const matchIndex = current.findIndex((item) => {
    if (passportNumber && item.passportNumber && item.passportNumber.toUpperCase() === passportNumber) {
      return true;
    }
    if (candidateName && item.candidateName && item.candidateName.toLowerCase() === candidateName.toLowerCase()) {
      return true;
    }
    return false;
  });

  let updatedList: CVHistoryItem[];
  let savedItem: CVHistoryItem;

  if (matchIndex !== -1) {
    // Update existing candidate snapshot
    const existing = current[matchIndex];
    savedItem = {
      ...existing,
      timestamp: Date.now(),
      dateFormatted,
      title,
      candidateName,
      passportNumber,
      templateId,
      data: JSON.parse(JSON.stringify(data)),
      style: style ? JSON.parse(JSON.stringify(style)) : existing.style,
      summary,
    };
    // Move updated item to front
    updatedList = [savedItem, ...current.filter((_, idx) => idx !== matchIndex)].slice(0, MAX_HISTORY_ITEMS);
  } else {
    // Brand new CV created
    savedItem = {
      id: `cv_hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateFormatted,
      title,
      candidateName,
      passportNumber,
      templateId,
      data: JSON.parse(JSON.stringify(data)),
      style: style ? JSON.parse(JSON.stringify(style)) : undefined,
      summary,
    };

    // Increment lifetime counter
    const currentTotal = getTotalCVsCount();
    localStorage.setItem(TOTAL_CVS_COUNTER_KEY, String(currentTotal + 1));

    updatedList = [savedItem, ...current].slice(0, MAX_HISTORY_ITEMS);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.warn('LocalStorage save warning, trimming:', err);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList.slice(0, 15)));
    } catch {
      // ignore
    }
  }

  // Dispatch global event so counters everywhere update automatically
  window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));

  return savedItem;
}

/**
 * Save a new explicit CV snapshot to history (e.g. on Print, on Export, or Manual Save)
 */
export function saveCVToHistory(
  data: CVData,
  templateId: CVTemplateId,
  style?: StyleConfig,
  customTitle?: string
): CVHistoryItem {
  const current = getCVHistory();
  const now = new Date();

  const candidateName = data.name.trim() || 'Untitled Candidate';
  const passportNumber = data.passportNumber?.trim().toUpperCase() || '';

  const dateFormatted = now.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const title =
    customTitle?.trim() ||
    `${candidateName}${passportNumber ? ` (${passportNumber})` : ''} - ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const summary = [
    passportNumber ? `পাসপোর্ট: ${passportNumber}` : null,
    data.mobile ? `মোবাইল: ${data.mobile}` : null,
    data.experiences?.length ? `অভিজ্ঞতা: ${data.experiences.length}টি` : null,
    data.educations?.length ? `শিক্ষা: ${data.educations.length}টি` : null,
  ].filter(Boolean).join(' • ');

  const newItem: CVHistoryItem = {
    id: `cv_hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateFormatted,
    title,
    candidateName,
    passportNumber,
    templateId,
    data: JSON.parse(JSON.stringify(data)),
    style: style ? JSON.parse(JSON.stringify(style)) : undefined,
    summary,
  };

  // Increment lifetime total
  const currentTotal = getTotalCVsCount();
  localStorage.setItem(TOTAL_CVS_COUNTER_KEY, String(currentTotal + 1));

  // Filter out identical within 3 seconds
  const filtered = current.filter((item) => {
    const isRecent = Math.abs(item.timestamp - newItem.timestamp) < 3000;
    const sameData = JSON.stringify(item.data) === JSON.stringify(newItem.data);
    return !(isRecent && sameData);
  });

  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage full, trimming history:', err);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 15)));
    } catch {
      // ignore
    }
  }

  // Dispatch global event for live counter update
  window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));

  return newItem;
}

/**
 * Delete a specific history item
 */
export function deleteHistoryItem(id: string): CVHistoryItem[] {
  const current = getCVHistory();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
  return updated;
}

/**
 * Clear all history
 */
export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pro_cv_history_updated'));
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
