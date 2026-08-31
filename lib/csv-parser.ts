import { MATERIALS_DATA } from './materials-data';

export interface MaterialItem {
  code: string;
  itemName: string;
  category: string;
  subCategory: string;
  specification: string;
  unit: string;
  rate: number;
  gst: number;
  source?: string;
}

export const materials: MaterialItem[] = MATERIALS_DATA;

const readLocalStorageArray = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(key);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const MULTILINGUAL_SYNONYMS: Record<string, string[]> = {
  "MAT-CEM-01": ["cement", "opc", "ppc", "सीमेंट", "सीमेंट की दर", "ಸಿಮೆಂಟ್", "ಸಿಮೆಂಟು", "ಸಿಮೆಂಟ್ ಬೆಲೆ", "ಸಿಮೆಂಟ್ ದರ", "సిమెంట్", "సిమెంటు", "సిమెంట్ ధర", "சிமெண்ட்", "சிமெண்ட் விலை", "സിമന്റ്", "സിമന്റ് നിരക്ക്", "সিমেন্ট", "সিমেন্টের দাম", "ସିମେଣ୍ଟ", "ସିମେଣ୍ଟ ଦର"],
  "MAT-STL-01": ["steel", "rebar", "tmt", "sariya", "स्टील", "सरिया", "सरिया रेट", "ಸ್ಟೀಲ್", "ಸರಿಯಾ", "ಸ್ಟೀಲ್ ಬೆಲೆ", "ಸ್ಟೀಲ್ ದರ", "ಸ್ಟಿಲ್", "స్టీల్", "స్టోల్", "స్టీల్ ధర", "స్టోల్ ధర", "ஸ்டீல்", "ஸ்டீல் விலை", "സ്റ്റീൽ", "സ്റ്റീൽ നിരക്ക്", "ഇസ്പത്", "ইস্পাত", "রড", "ଷ୍ଟିଲ୍", "ରଡ୍"],
  "MAT-MSND-01": ["m-sand", "msand", "sand", "m sand", "रेत", "बालू", "एम सैंड", "मराळु", "ಮರಳು", "ಎಂ ಸ್ಯಾಂಡ್", "ಮರಳು ಬೆಲೆ", "ಇಸುಕ", "ఎం శాండ్", "ఇసుక ధర", "மணல்", "எம் சாண்ட்", "மணல் விலை", "മണൽ", "എം സാൻഡ്", "മണൽ നിരക്ക്", "বালু", "ବାଲି"],
  "MAT-AGG-20": ["aggregate", "jelly", "20mm", "coarse aggregate", "गिट्टी", "जेली", "ಜಲ್ಲಿ", "20ಎಂಎಂ", "ಜಲ್ಲಿ ಬೆಲೆ", "జెల్లీ", "జెల్లీ ధర", "ஜெல்லி", "ஜெல்லி விலை", "ജെല്ലി", "ജെല്ലി നിരക്ക്", "পাথর", "ଗିଟି"],
  "MAT-BRK-01": ["brick", "red brick", "clay brick", "ईंट", "इंट", "इट्टा", "इंत", "ಇಟ್ಟಿಗೆ", "ಇಷ್ಟಿಗೆ", "ಇಟ್ಟಿಗೆ ಬೆಲೆ", "ಇಟ್ಟುಗೆ", "ఇటుక", "ఇటుకలు", "ఇటుక ధర", "செங்கல்", "செங்கல் விலை", "இஷ்டிக", "ഇഷ്ടിക", "ഇഷ്ടിക നിരക്ക്", "ইট", "ইটের দাম", "ଇଟା", "ଇଟା ଦର"],
  "MAT-BLK-01": ["block", "concrete block", "solid block", "ब्लॉक", "कंक्रीट ब्लॉक", "ಬ್ಲಾಕ್", "ಬ್ಲಾಕ್ಸ್", "ಬ್ಲಾಕ್ ಬೆಲೆ", "బ్లాక్", "బ్లాకులు", "బ్లాక్ ధర", "பிளாக்", "பிளாக் விலை", "ബ്ലോക്ക്", "ബ്ലോക്ക് നിരക്ക്", "ব্লক", "ବ୍ଲକ୍"],
  "MAT-PNT-01": ["paint", "emulsion", "wall paint", "पेंट", "रंग", "पेइंट", "ಪೇಂಟ್", "ಬಣ್ಣ", "ಪೇಂಟ್ ಬೆಲೆ", "ಪೆയിಂಟ್", "పెయింట్", "రంగు", "పెయింట్ ధర", "பெயிண்ட்", "சாயம்", "பெயிண்ட் விலை", "പെയിന്റ്", "രസായനം", "പെയിന്റ് നിരക്ക്", "রং", "ପେଣ୍ଟ"],
  "MAT-VIT-01": ["tile", "tiles", "vitrified tile", "flooring", "टाइल", "टाइल्स", "टाइल्स की कीमत", "ಟೈಲ್ಸ್", "ಟೈಲ್", "ಟೈಲ್ಸ್ ಬೆಲೆ", "టైల్స్", "టైల్", "టైల్స్ ధర", "டைல்ஸ்", "டைல்", "டைல்ஸ் விலை", "ടൈലുകൾ", "ടൈൽ", "ടൈലുകൾ നിരക്ക്", "টাইলস", "ଟାଇଲ୍ସ"],
  "SRV-PLS-LAY": ["plastering", "plaster labour", "प्लास्टर", "पलस्तर", "प्लास्टर मजदूरी", "ಪ್ಲಾಸ್ಟರಿಂಗ್", "ಪ್ಲಾಸ್ಟರ್ ಕೂಲಿ", "ಪ್ಲಾಸ್ಟರಿಂಗ್ ಕೆಲಸ", "ಪ್ಲಾಸ್ಟರಿಂಗ್ ದರ", "ప్లాస్టరింగ్", "ప్లాస్టరింగ్ పని", "ప్లాస్టరింగ్ కూలీ", "பூச்சு", "பூச்சு கூலி", "பூச்சு வேலை", "പ്ലാസ്റ്ററിംഗ്", "പൂച്ച് പണി", "പൂച്ച് കൂലി", "প্লাস্টারিং", "ପ୍ଲାଷ୍ଟରିଂ"],
  "SRV-BBN-LAY": ["bar bending", "steel fixing", "rebar labour", "सरिया कटाई", "बार बेंडिंग", "बेंडिंग मजदूरी", "ಬಾರ್ ಬೆಂಡಿಂಗ್", "ಸ್ಟೀಲ್ ಕೆಲಸ", "ಬಾರ್ ಬೆಂಡಿಂಗ್ ಕೂಲಿ", "ಬಾರ್ ಬೆಂಡಿಂಗ್ ದರ", "బార్ బెండింగ్", "స్టీల్ పని", "బార్ బెండింగ్ కూలీ", "பார் பெண்டிங்", "ஸ்டீல் கூலி", "பார் பெண்டிங் கூலி", "ബാർ ബെൻഡിംഗ്", "സ്റ്റീൽ പണി", "ബാർ ബെൻഡിംഗ് കൂലി", "বার বেন্ডিং", "ବାର୍ ବେଣ୍ଡିଂ"]
};

export const getAllLiveMasterItems = (): MaterialItem[] => {
  const liveItems: MaterialItem[] = [];

  const stores = [
    { key: "bm_material_rates", defaultCategory: "Materials" },
    { key: "bm_labour_rates", defaultCategory: "Labour" },
    { key: "bm_service_rates", defaultCategory: "Services" },
    { key: "bm_equipment_rates", defaultCategory: "Equipment" }
  ];

  stores.forEach(store => {
    const rows = readLocalStorageArray(store.key);
    rows.forEach(row => {
      if (row && row.isActive !== false) {
        const itemRate = Number(row.rate || row.currentRate || row.referenceRate || row.price || 0);
        if (itemRate > 0) {
          liveItems.push({
            code: String(row.code || row.masterItemCode || row.itemCode || `MAT-LIVE-${Date.now()}`),
            itemName: String(row.item || row.itemName || row.material || row.service || row.trade || row.name || "").trim(),
            category: String(row.category || store.defaultCategory),
            subCategory: String(row.subCategory || row.trade || "Admin Master Rate"),
            specification: String(row.specification || row.unit || row.description || "Standard Grade"),
            unit: String(row.unit || "unit").trim(),
            rate: itemRate > 500 && String(row.unit || '').toUpperCase() === 'KG' ? itemRate / 1000 : itemRate,
            gst: Number(row.gst || row.gstPercent || 18),
            source: "Admin Approved Master Store"
          });
        }
      }
    });
  });

  const existingCodes = new Set(liveItems.map(i => i.code.toLowerCase()));
  MATERIALS_DATA.forEach(staticItem => {
    if (!existingCodes.has(staticItem.code.toLowerCase())) {
      liveItems.push({ ...staticItem, source: "Static Base Master List" });
    }
  });

  return liveItems;
};

// MULTI-LINGUAL STOPWORD REMOVER FOR ALL 8 REGIONAL LANGUAGES
export const cleanSearchQuery = (query: string): string => {
  const cleanText = query.toLowerCase().trim();
  
  return cleanText
    // English
    .replace(/\b(what|whats|what is|the|a|an|of|rate|price|today|todays|cost|mulya|bhav|vai|dhar|please|tell|show|give|need|want|i need|i want|the rate of|rate of|price of|cost of|with|with a|how|how much|how much is|tell me|for|and|to|in|on|at|is|are|was|were|be|been|being|can|could|would|should|may|might|must|will|shall|this|that|these|those|my|your|our|their)\b/g, '')
    // Hindi / Urdu (हिन्दी)
    .replace(/\b(क्या|का|की|के|दर|की कीमत|की रेट|कितना|कितने|बताओ|बताइये|आज|आज का|आज की|चाहिए|दाम|भाव|मूल्य|रेट)\b/g, '')
    // Kannada (ಕನ್ನಡ)
    .replace(/\b(ಏನು|ದರ|ಬೆಲೆ|ಎಷ್ಟು|ತಿಳಿಸಿ|ಇಂದಿನ|ಇಂದಿನ ದರ|ತೋರಿಸಿ|ಬೇಕು|ಕೊಡಿ|ರೇಟ್)\b/g, '')
    // Telugu (తెలుగు)
    .replace(/\b(ఏమిటి|ధర|రేటు|ఎంత|చెప్పండి|ఈరోజు|ఈరోజు ధర|చూపించండి|కావాలి|రేట్)\b/g, '')
    // Tamil (தமிழ்)
    .replace(/\b(என்ன|விலை|விகிதம்|எவ்வளவு|சொல்லுங்கள்|இன்றைய|காட்டு|வேண்டும்|ரேட்)\b/g, '')
    // Malayalam (മലയാളം)
    .replace(/\b(എന്താണ്|വില|നിരക്ക്|എത്ര|പറയൂ|ഇന്നത്തെ|കാണിക്കൂ|വേണം|റേറ്റ്)\b/g, '')
    // Bengali (বাংলা)
    .replace(/\b(কী|দাম|দর|কত|বলুন|আজকের|দেখান|চাই|রেট)\b/g, '')
    // Odia (ଓଡ଼ିଆ)
    .replace(/\b(କଣ|ଦର|ମୂଲ୍ୟ|କେତେ|କୁହନ୍ତୁ|ଆଜିର|ଦେଖାନ୍ତୁ|ଦରକାର|ରେଟ୍)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const searchMaterial = (materialsList: MaterialItem[], query: string): MaterialItem | null => {
  const allMasterItems = materialsList && materialsList.length > 0 ? materialsList : getAllLiveMasterItems();
  const rawQuery = query.toLowerCase().trim();
  const searchText = cleanSearchQuery(query);
  
  if (!rawQuery && !searchText) return null;

  // 0. Check Multi-Lingual Synonym Dictionary Match
  for (const [code, synonyms] of Object.entries(MULTILINGUAL_SYNONYMS)) {
    if (synonyms.some(syn => rawQuery.includes(syn.toLowerCase()) || (searchText && searchText.includes(syn.toLowerCase())))) {
      const match = allMasterItems.find(item => item.code.toLowerCase() === code.toLowerCase());
      if (match) return match;
    }
  }

  // 1. Exact Code Match
  if (searchText) {
    let found = allMasterItems.find(item => item.code.toLowerCase() === searchText);
    if (found) return found;
  }
  
  // 2. Check if searchText is in itemName
  if (searchText) {
    let found = allMasterItems.find(item => 
      item.itemName.toLowerCase().includes(searchText)
    );
    if (found) return found;
  }
  
  // 3. Check if searchText is in category / subCategory / specification
  if (searchText) {
    let found = allMasterItems.find(item => 
      item.category.toLowerCase().includes(searchText) ||
      item.subCategory.toLowerCase().includes(searchText) ||
      item.specification.toLowerCase().includes(searchText)
    );
    if (found) return found;
  }

  // 4. Fallback search on raw query words
  const words = (searchText || rawQuery).split(' ').filter(w => w.length > 2);
  for (const word of words) {
    let found = allMasterItems.find(item => 
      item.itemName.toLowerCase().includes(word) ||
      item.category.toLowerCase().includes(word) ||
      item.subCategory.toLowerCase().includes(word) ||
      item.specification.toLowerCase().includes(word)
    );
    if (found) return found;
  }
  
  return null;
};

export const getMaterialsByKeyword = (materialsList: MaterialItem[], keyword: string, limit = 10): MaterialItem[] => {
  const allMasterItems = materialsList && materialsList.length > 0 ? materialsList : getAllLiveMasterItems();
  const cleanKeyword = keyword.toLowerCase().trim();
  
  return allMasterItems.filter(item => 
    item.itemName.toLowerCase().includes(cleanKeyword) ||
    item.category.toLowerCase().includes(cleanKeyword) ||
    item.subCategory.toLowerCase().includes(cleanKeyword) ||
    item.specification.toLowerCase().includes(cleanKeyword)
  ).slice(0, limit);
};

export const calculateRateWithGST = (rate: number, gst: number): string => {
  const gstAmount = rate * (gst / 100);
  const totalRate = rate + gstAmount;
  return `₹${rate.toLocaleString('en-IN')} (Excl GST) / ₹${totalRate.toLocaleString('en-IN')} (Incl ${gst}% GST)`;
};