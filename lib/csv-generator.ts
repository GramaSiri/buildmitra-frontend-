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
}

export const materials: MaterialItem[] = MATERIALS_DATA;

export const searchMaterial = (materials: MaterialItem[], query: string): MaterialItem | null => {
  const cleanText = query.toLowerCase().trim();
  
  const searchText = cleanText
    .replace(/\b(what|whats|what is|the|a|an|of|rate|price|today|todays|ka|kya|hai|kitna|kiti|entha|endha|vila|bela|dara|dar|cost|mulya|bhav|vai|dhar|please|tell|show|give|need|want|i need|i want|the rate of|rate of|price of|cost of|with|with a|how|how much|how much is|tell me|batao|bata|do|for|and|to|in|on|at|is|are|was|were|be|been|being|can|could|would|should|may|might|must|will|shall|this|that|these|those|my|your|our|their)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!searchText) return null;
  
  let found = materials.find(item => item.itemName.toLowerCase().trim() === searchText);
  if (found) return found;
  
  found = materials.find(item => item.itemName.toLowerCase().startsWith(searchText));
  if (found) return found;
  
  found = materials.find(item => item.itemName.toLowerCase().includes(searchText));
  if (found) return found;
  
  found = materials.find(item => item.category.toLowerCase().includes(searchText) || item.subCategory.toLowerCase().includes(searchText));
  if (found) return found;
  
  found = materials.find(item => item.specification.toLowerCase().includes(searchText));
  if (found) return found;
  
  if (searchText.split(' ').length === 1) {
    const word = searchText;
    const nameMatches = materials.filter(item => item.itemName.toLowerCase().includes(word));
    if (nameMatches.length > 0) return nameMatches[0];
    
    const categoryMatches = materials.filter(item => item.category.toLowerCase().includes(word) || item.subCategory.toLowerCase().includes(word));
    if (categoryMatches.length > 0) return categoryMatches[0];
    
    const specMatches = materials.filter(item => item.specification.toLowerCase().includes(word));
    if (specMatches.length > 0) return specMatches[0];
  }
  
  const brands = ["fevicol", "araldite", "jaquar", "hindware", "cera", "parryware", "roca", "grohe", "godrej", "hettich", "ozone", "ebco", "hafele", "pidilite", "ultratech", "acc", "ambuja", "shree", "birla", "dalmia", "ramco", "tata", "jsw", "sail", "tmt", "asian", "berger", "nerolac"];
  
  for (const brand of brands) {
    if (searchText.includes(brand)) {
      found = materials.find(item => item.itemName.toLowerCase().includes(brand) || item.specification.toLowerCase().includes(brand) || item.category.toLowerCase().includes(brand));
      if (found) return found;
    }
  }
  
  return null;
};

export const getMaterialsByKeyword = (materials: MaterialItem[], keyword: string, limit = 10): MaterialItem[] => {
  const cleanKeyword = keyword.toLowerCase().trim();
  
  const allMatches = materials.filter(item => 
    item.itemName.toLowerCase().includes(cleanKeyword) ||
    item.category.toLowerCase().includes(cleanKeyword) ||
    item.subCategory.toLowerCase().includes(cleanKeyword) ||
    item.specification.toLowerCase().includes(cleanKeyword)
  );
  
  return allMatches.slice(0, limit);
};

export const calculateRateWithGST = (rate: number, gst: number): string => {
  const gstAmount = rate * (gst / 100);
  const totalRate = rate + gstAmount;
  return `₹${rate.toLocaleString('en-IN')} (Excl GST) / ₹${totalRate.toLocaleString('en-IN')} (Incl ${gst}% GST)`;
};

export const generateCSV = (materialsList: MaterialItem[]): string => {
  const headers = ['Code', 'Item Name', 'Category', 'Sub Category', 'Specification', 'Unit', 'Rate', 'GST %'];
  const rows = (materialsList || []).map(item => [
    `"${item.code || ''}"`,
    `"${(item.itemName || '').replace(/"/g, '""')}"`,
    `"${(item.category || '').replace(/"/g, '""')}"`,
    `"${(item.subCategory || '').replace(/"/g, '""')}"`,
    `"${(item.specification || '').replace(/"/g, '""')}"`,
    `"${item.unit || ''}"`,
    item.rate || 0,
    item.gst || 0
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};