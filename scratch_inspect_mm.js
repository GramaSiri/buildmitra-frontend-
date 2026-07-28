const fs = require('fs');
const XLSX = require('xlsx');

const filePath = 'D:\\images\\Desktop\\MM_26_7.csv';

console.log('--- FILE INSPECTION START ---');
console.log('File Path:', filePath);
console.log('File Exists:', fs.existsSync(filePath));

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log('Sheet Name:', sheetName);
console.log('Total Raw Rows (including header):', rawData.length);

const headers = rawData[0];
console.log('Headers:', JSON.stringify(headers, null, 2));

const rows = XLSX.utils.sheet_to_json(worksheet);
console.log('Parsed Rows Count:', rows.length);

let totalRows = rows.length;
let validDataRows = 0;
let emptyRows = 0;
let missingItemCodes = 0;
let missingItemNames = 0;
let missingUnits = 0;
let invalidRates = 0;
let invalidGst = 0;

const itemCodeMap = new Map();
const duplicateCodes = [];
const categoriesSet = new Set();
const subcategoriesSet = new Set();
const brandsSet = new Set();
const unitsSet = new Set();

rows.forEach((row, idx) => {
  const rowNum = idx + 2;
  const values = Object.values(row).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (values.length === 0) {
    emptyRows++;
    return;
  }

  const pick = (keys) => {
    for (const k of keys) {
      for (const rk of Object.keys(row)) {
        if (rk.toLowerCase().trim() === k.toLowerCase().trim()) {
          return row[rk];
        }
      }
    }
    return undefined;
  };

  const code = pick(['Master Code', 'Master Item Code', 'Item Code', 'Code', 'masterItemCode', 'itemCode']);
  const name = pick(['Item Name', 'Canonical Item Name', 'Name', 'Master Item Name', 'itemName']);
  const unit = pick(['Unit', 'unit', 'UOM']);
  const rateStr = pick(['Base Rate/Price', 'Reference Rate', 'Rate', 'Admin Rate', 'rate', 'referenceRate']);
  const gstStr = pick(['GST/TAX', 'GST', 'gst', 'GST %']);
  const category = pick(['Category', 'category']);
  const subcategory = pick(['Sub Category', 'Subcategory', 'SubCategory']);
  const brand = pick(['Brand/Short Code', 'Brand']);

  let isValid = true;

  const cleanCode = code ? String(code).trim() : '';
  const cleanName = name ? String(name).trim() : '';
  const cleanUnit = unit ? String(unit).trim() : '';

  if (!cleanCode) {
    missingItemCodes++;
    isValid = false;
  } else {
    if (itemCodeMap.has(cleanCode)) {
      duplicateCodes.push({ code: cleanCode, row1: itemCodeMap.get(cleanCode), row2: rowNum });
    } else {
      itemCodeMap.set(cleanCode, rowNum);
    }
  }

  if (!cleanName) {
    missingItemNames++;
    isValid = false;
  }

  if (!cleanUnit) {
    missingUnits++;
    isValid = false;
  } else {
    unitsSet.add(cleanUnit);
  }

  const rateNum = Number(rateStr);
  if (rateStr !== undefined && rateStr !== null && rateStr !== '' && (isNaN(rateNum) || rateNum < 0)) {
    invalidRates++;
  }

  const gstNum = Number(gstStr);
  // GST can be decimal (0.18) or percentage (18)
  if (gstStr !== undefined && gstStr !== null && gstStr !== '' && isNaN(gstNum)) {
    invalidGst++;
  }

  if (category) categoriesSet.add(String(category).trim());
  if (subcategory) subcategoriesSet.add(String(subcategory).trim());
  if (brand) brandsSet.add(String(brand).trim());

  if (isValid) {
    validDataRows++;
  }
});

console.log('\n--- DETAILED INSPECTION SUMMARY ---');
console.log('Exact File Name:', 'MM_26_7.csv');
console.log('Worksheet Used:', sheetName);
console.log('Total Rows (excluding header):', totalRows);
console.log('Valid Data Rows:', validDataRows);
console.log('Empty Rows:', emptyRows);
console.log('Unique Item Codes Count:', itemCodeMap.size);
console.log('Duplicate Item Codes Count:', duplicateCodes.length);
if (duplicateCodes.length > 0) {
  console.log('Duplicate Details:', duplicateCodes);
}
console.log('Missing Item Codes:', missingItemCodes);
console.log('Missing Item Names:', missingItemNames);
console.log('Missing Units:', missingUnits);
console.log('Invalid Rates:', invalidRates);
console.log('Invalid GST values:', invalidGst);
console.log('Unique Categories Count:', categoriesSet.size);
console.log('Unique Subcategories Count:', subcategoriesSet.size);
console.log('Unique Brands Count:', brandsSet.size);
console.log('Unique Units List:', Array.from(unitsSet));

console.log('--- FILE INSPECTION END ---');
