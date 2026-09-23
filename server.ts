import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toTitleCaseServer(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

function formatBangladeshiAddressServer(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().replace(/\s+/g, ' ');

  if (/Vill/i.test(clean) && /Dist/i.test(clean)) {
    return clean
      .replace(/(?:Vill(?:age)?)\s*[:=-]?\s*/gi, 'Vill: ')
      .replace(/(?:P\.?O\.?|Post(?:\s*Office)?)\s*[:=-]?\s*/gi, 'P.O: ')
      .replace(/(?:P\.?S\.?|Police\s*Station|Thana)\s*[:=-]?\s*/gi, 'P.S: ')
      .replace(/(?:Dist(?:rict)?)\s*[:=-]?\s*/gi, 'Dist: ')
      .replace(/\s*,\s*/g, ', ')
      .trim();
  }

  const tokens = clean
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length >= 4) {
    let village = '';
    let po = '';
    let ps = '';
    let dist = '';

    const poIndex = tokens.findIndex((t) => /\b\d{4}\b/.test(t));
    if (poIndex !== -1) {
      po = tokens[poIndex];
      const remaining = tokens.filter((_, idx) => idx !== poIndex);
      village = remaining[0] || '';
      ps = remaining[1] || '';
      dist = remaining.slice(2).join(', ') || '';
    } else {
      village = tokens[0];
      po = tokens[1];
      ps = tokens[2];
      dist = tokens.slice(3).join(', ');
    }

    village = toTitleCaseServer(village.replace(/^(?:Vill(?:age)?|গ্রাম)[\s:=]*/i, '').trim());
    po = toTitleCaseServer(po.replace(/^(?:P\.?O\.?|Post(?:\s*Office)?|ডাকঘর)[\s:=]*/i, '').trim());
    ps = toTitleCaseServer(ps.replace(/^(?:P\.?S\.?|Police\s*Station|Thana|থানা)[\s:=]*/i, '').trim());
    dist = toTitleCaseServer(dist.replace(/^(?:Dist(?:rict)?|জেলা)[\s:=]*/i, '').trim());

    return `Vill: ${village}, P.O: ${po}, P.S: ${ps}, Dist: ${dist}`;
  } else if (tokens.length === 3) {
    const village = toTitleCaseServer(tokens[0].replace(/^(?:Vill(?:age)?|গ্রাম)[\s:=]*/i, '').trim());
    const middle = tokens[1];
    const dist = toTitleCaseServer(tokens[2].replace(/^(?:Dist(?:rict)?|জেলা)[\s:=]*/i, '').trim());

    if (/\b\d{4}\b/.test(middle)) {
      const po = toTitleCaseServer(middle.replace(/^(?:P\.?O\.?|Post(?:\s*Office)?|ডাকঘর)[\s:=]*/i, '').trim());
      return `Vill: ${village}, P.O: ${po}, Dist: ${dist}`;
    } else {
      const ps = toTitleCaseServer(middle.replace(/^(?:P\.?S\.?|Police\s*Station|Thana|থানা)[\s:=]*/i, '').trim());
      return `Vill: ${village}, P.S: ${ps}, Dist: ${dist}`;
    }
  }

  return clean;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with 30mb limit for high-res passport photos
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
    });
  });

  // API: Scan Passport using Gemini 3.8 Flash Vision
  app.post('/api/scan-passport', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: false,
          error: 'NO_API_KEY',
          message: 'Server GEMINI_API_KEY is not configured, falling back to local OCR',
        });
      }

      const { imageBase64, mimeType, rawText } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const extractionPrompt = `You are a world-class passport OCR and document data extractor specializing in Bangladeshi and international passports (MRP Machine Readable Passports, e-Passports, and National ID details).
Extract all official passport fields accurately from the provided passport image or text.
Pay close attention to standard Bangladeshi passport layout:
- Personal details (Name, Father's Name, Mother's Name, Spouse if any)
- Identification (Passport No, Personal No / NID, Previous Passport No)
- Dates (Date of Birth, Date of Issue, Date of Expiry)
- Location (Place of Birth, Place of Issue e.g. DIP/DHAKA, Permanent Address, Present Address)
- Physical details (Gender, Religion, Marital Status, Height, Weight)
- Emergency contact (Name, Relationship, Address, Telephone No)
- MRZ lines (2 lines at bottom starting with P<...)

IMPORTANT RULES:
- Output clean text without unwanted punctuation or labels.
- If a field is not visible or not present, return an empty string "". Do NOT hallucinate.
- Return exact uppercase text for Name, Father's Name, Mother's Name, and Passport No as standard on passports.
- ADDRESS FORMAT: Format both permanentAddress and presentAddress in the standard Bangladeshi structure:
  "Vill: [Village Name], P.O: [Post Office], P.S: [Police Station / Thana], Dist: [District]"
  Example: "Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi"
  If a 4-digit postal code is present: "Vill: Paiksha, P.O: Ghorashal - 1613, P.S: Palash, Dist: Narsingdi"
  If the passport only has comma-separated components (e.g. "UTTAR CHANDAN, PALASH, JHINARDI - 1610, NARSINGDI"), organize them into "Vill: Uttar Chandan, P.O: Jhinardi - 1610, P.S: Palash, Dist: Narsingdi".`;

      let contents: any;

      if (imageBase64) {
        const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
        const cleanMime = mimeType || 'image/jpeg';

        contents = [
          {
            inlineData: {
              mimeType: cleanMime,
              data: cleanBase64,
            },
          },
          { text: extractionPrompt },
        ];
      } else if (rawText) {
        contents = [
          { text: extractionPrompt },
          { text: `Here is the passport raw text to extract fields from:\n${rawText}` },
        ];
      } else {
        return res.status(400).json({ success: false, error: 'Missing imageBase64 or rawText' });
      }

      const candidateModels = [
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
      ];

      let lastError: any = null;
      let extracted: any = null;
      let usedModel = '';

      for (const modelName of candidateModels) {
        try {
          const isLite = modelName.includes('lite');
          const response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              thinkingConfig: {
                thinkingLevel: isLite ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
              },
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  passportNumber: { type: Type.STRING, description: 'Passport number e.g. A21743327' },
                  fullName: { type: Type.STRING, description: 'Full legal name in English uppercase e.g. ALAMEN' },
                  fatherName: { type: Type.STRING, description: "Father's name e.g. SHEIKH SHAMSUL ISLAM" },
                  motherName: { type: Type.STRING, description: "Mother's name e.g. SAJEDA BEGUM" },
                  dob: { type: Type.STRING, description: 'Date of birth e.g. 25 Aug 2007' },
                  dateOfIssue: { type: Type.STRING, description: 'Date of issue e.g. 13 JUN 2022' },
                  dateOfExpiry: { type: Type.STRING, description: 'Date of expiry e.g. 15 Feb 2036' },
                  placeOfIssue: { type: Type.STRING, description: 'Place of issue e.g. DIP/DHAKA' },
                  gender: { type: Type.STRING, description: 'Gender e.g. Male or Female' },
                  nationality: { type: Type.STRING, description: 'Nationality e.g. Bangladeshi by Birth' },
                  religion: { type: Type.STRING, description: 'Religion e.g. Islam' },
                  maritalStatus: { type: Type.STRING, description: 'Marital status e.g. Married or Single' },
                  height: { type: Type.STRING, description: "Height e.g. 5' 6\"" },
                  weight: { type: Type.STRING, description: 'Weight e.g. 62 KG' },
                  personalNo: { type: Type.STRING, description: 'Personal No / National ID / NID e.g. 4164712004' },
                  previousPassportNumber: { type: Type.STRING, description: 'Previous passport number e.g. AA2328199' },
                  placeOfBirth: { type: Type.STRING, description: 'Place of birth district e.g. NARSINGDI' },
                  permanentAddress: {
                    type: Type.STRING,
                    description:
                      'Permanent address formatted in standard Bangladeshi style: Vill: [Village], P.O: [Post Office], P.S: [Police Station], Dist: [District]. e.g. Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi',
                  },
                  presentAddress: {
                    type: Type.STRING,
                    description:
                      'Present address formatted in standard Bangladeshi style: Vill: [Village], P.O: [Post Office], P.S: [Police Station], Dist: [District]. e.g. Vill: Paiksha, P.O: Ghorashal, P.S: Palash, Dist: Narsingdi',
                  },
                  emergencyContactName: { type: Type.STRING, description: 'Emergency contact name' },
                  emergencyContactRelation: { type: Type.STRING, description: 'Relationship e.g. MOTHER' },
                  emergencyContactPhone: { type: Type.STRING, description: 'Phone number e.g. +8801700903918' },
                  emergencyContactAddress: { type: Type.STRING, description: 'Emergency contact address' },
                  telephoneNo: { type: Type.STRING, description: 'Candidate telephone or mobile number found on passport or emergency contact e.g. +8801780609899' },
                  rawTextSummary: { type: Type.STRING, description: 'Brief transcription summary of visible text' },
                },
                required: ['passportNumber', 'fullName'],
              },
            },
          });

          extracted = JSON.parse(response.text || '{}');
          usedModel = modelName;
          break; // Succeeded!
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} attempt failed (status/demand spike):`, err?.message || err);
          // If 503 UNAVAILABLE or 429 or rate-limited, wait 300ms and try next candidate model
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (extracted) {
        if (extracted.permanentAddress) {
          extracted.permanentAddress = formatBangladeshiAddressServer(extracted.permanentAddress);
        }
        if (extracted.presentAddress) {
          extracted.presentAddress = formatBangladeshiAddressServer(extracted.presentAddress);
        } else if (extracted.permanentAddress) {
          extracted.presentAddress = extracted.permanentAddress;
        }
        if (!extracted.telephoneNo && extracted.emergencyContactPhone) {
          extracted.telephoneNo = extracted.emergencyContactPhone;
        }
        return res.json({
          success: true,
          data: extracted,
          source: usedModel,
        });
      }

      throw lastError || new Error('All AI models unavailable');
    } catch (err: any) {
      console.error('Passport scan server error:', err);
      return res.json({
        success: false,
        error: err.message || 'SCAN_FAILED',
        fallbackToLocal: true,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
