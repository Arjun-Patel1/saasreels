import fs from 'fs';
import path from 'path';

export interface SearchInsightRecord {
  id: string;
  queryOrUrl: string;
  brandName: string;
  categoryType: string;      // e.g. "AI Agency", "B2B SaaS", "Dev Tools", "E-commerce", "Fintech"
  subType: string;           // e.g. "shuvalt", "lead gen automation", "database", "analytics"
  searchCount: number;
  extractedKeywords: string[];
  topPainPoints: string[];
  bestPerformingAngle?: string;
  lastSearchedAt: string;
  firstSeenAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SEARCH_DB_FILE = path.join(DATA_DIR, 'search_telemetry.json');

function ensureSearchDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SEARCH_DB_FILE)) {
    const seedRecords: SearchInsightRecord[] = [
      {
        id: 'srch_1',
        queryOrUrl: 'https://shuvalt.com',
        brandName: 'Shuvalt',
        categoryType: 'AI Agency',
        subType: 'shuvalt',
        searchCount: 8,
        extractedKeywords: ['AI workflow automation', 'cold outreach agents', 'lead generation AI', 'custom LLMs'],
        topPainPoints: ['Spending $4,000/mo on SDRs that send 20 emails a day', 'Manual repetitive client onboarding workflows'],
        bestPerformingAngle: 'Problem-Agitate-Solve',
        lastSearchedAt: new Date().toISOString(),
        firstSeenAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'srch_2',
        queryOrUrl: 'https://linear.app',
        brandName: 'Linear',
        categoryType: 'Dev Tools',
        subType: 'issue tracking',
        searchCount: 14,
        extractedKeywords: ['speed', 'keyboard-first', 'cycles', 'git sync'],
        topPainPoints: ['Clunky slow Jira boards that crash developer flow', 'Complex permission matrices for small teams'],
        bestPerformingAngle: 'POV Cheat Code',
        lastSearchedAt: new Date(Date.now() - 3600000).toISOString(),
        firstSeenAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 'srch_3',
        queryOrUrl: 'https://supabase.com',
        brandName: 'Supabase',
        categoryType: 'B2B Backend',
        subType: 'postgres database',
        searchCount: 22,
        extractedKeywords: ['open source', 'Postgres', 'instant Auth', 'real-time subscriptions'],
        topPainPoints: ['Surprise $10,000 Firebase billing spikes', 'Proprietary vendor lock-in with NoSQL'],
        bestPerformingAngle: 'Unfiltered Founder Story',
        lastSearchedAt: new Date(Date.now() - 7200000).toISOString(),
        firstSeenAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    fs.writeFileSync(SEARCH_DB_FILE, JSON.stringify(seedRecords, null, 2), 'utf-8');
  }
}

function readSearchRecords(): SearchInsightRecord[] {
  ensureSearchDb();
  try {
    const raw = fs.readFileSync(SEARCH_DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSearchRecords(records: SearchInsightRecord[]) {
  ensureSearchDb();
  fs.writeFileSync(SEARCH_DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export const searchTelemetryDb = {
  /**
   * Automatically classifies and logs user query/URL into structured category & sub-type.
   */
  logSearchInsight(params: {
    queryOrUrl: string;
    brandName?: string;
    description?: string;
    features?: string[];
  }): SearchInsightRecord {
    const records = readSearchRecords();
    const query = params.queryOrUrl.trim();
    const qLower = query.toLowerCase();

    // Smart Category & Sub-Type Classifier
    let categoryType = 'B2B SaaS';
    let subType = params.brandName?.toLowerCase().trim() || 'general';

    if (/agency|client|consulting|outreach|marketing agency|automation agency|shuvalt/i.test(qLower) || /agency/i.test(params.description || '')) {
      categoryType = 'AI Agency';
      subType = /shuvalt/i.test(qLower) ? 'shuvalt' : 'client automation';
    } else if (/dev|code|git|api|database|postgres|linear|terminal|sdk|infra/i.test(qLower) || /developer|api/i.test(params.description || '')) {
      categoryType = 'Dev Tools';
      subType = /database|postgres/i.test(qLower) ? 'database' : 'dev productivity';
    } else if (/ai|gpt|llm|voice|bot|agent|model|generator|neural/i.test(qLower)) {
      categoryType = 'AI Tool / Platform';
      subType = 'generative AI';
    } else if (/store|shop|ecommerce|shopify|product|apparel/i.test(qLower)) {
      categoryType = 'E-commerce';
      subType = 'D2C brand';
    }

    const brandName = params.brandName || (query.includes('.') ? query.replace(/https?:\/\//, '').split('.')[0] : query);

    // Check if record already exists to increment search frequency
    const existingIdx = records.findIndex(
      (r) => r.queryOrUrl.toLowerCase() === qLower || r.brandName.toLowerCase() === brandName.toLowerCase()
    );

    if (existingIdx !== -1) {
      records[existingIdx].searchCount += 1;
      records[existingIdx].lastSearchedAt = new Date().toISOString();
      if (params.features && params.features.length > 0) {
        records[existingIdx].extractedKeywords = Array.from(
          new Set([...records[existingIdx].extractedKeywords, ...params.features])
        ).slice(0, 8);
      }
      writeSearchRecords(records);
      return records[existingIdx];
    }

    const newRecord: SearchInsightRecord = {
      id: `srch_${Date.now()}`,
      queryOrUrl: query,
      brandName: brandName.charAt(0).toUpperCase() + brandName.slice(1),
      categoryType,
      subType,
      searchCount: 1,
      extractedKeywords: params.features || ['fast setup', 'workflow automation', 'scalable results'],
      topPainPoints: ['High manual costs', 'Slow turnaround times', 'Complex legacy software'],
      bestPerformingAngle: 'Problem-Agitate-Solve',
      lastSearchedAt: new Date().toISOString(),
      firstSeenAt: new Date().toISOString(),
    };

    records.unshift(newRecord);
    writeSearchRecords(records);
    return newRecord;
  },

  getAllRecords(): SearchInsightRecord[] {
    return readSearchRecords();
  },

  getKnowledgeForCategory(categoryType: string, subType?: string): SearchInsightRecord | undefined {
    const records = readSearchRecords();
    return records.find(
      (r) =>
        r.categoryType.toLowerCase() === categoryType.toLowerCase() ||
        (subType && r.subType.toLowerCase().includes(subType.toLowerCase()))
    );
  },
};
