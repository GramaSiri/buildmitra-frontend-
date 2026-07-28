const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const csvPath = getArg("--csv");
const outputDir = getArg("--output", "./downloads");
const reportPath = getArg("--report", "./reports/fetch-report.csv");
const limit = Number(getArg("--limit", "50"));

if (!csvPath || !fs.existsSync(csvPath)) {
  console.error("CSV file not found:", csvPath);
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      value += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(value);
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += ch;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function safeName(code) {
  return clean(code).replace(/[^A-Za-z0-9_-]/g, "-") + ".webp";
}

async function searchOpenverse(query) {
  const url =
    "https://api.openverse.org/v1/images/?" +
    new URLSearchParams({
      q: query,
      page_size: "15",
      mature: "false"
    });

  const response = await fetch(url, {
    headers: {
      "User-Agent": "BuildMitraImageFetcher/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Openverse search failed: ${response.status}`);
  }

  const json = await response.json();

  return (json.results || [])
    .map(item => ({
      imageUrl: item.url || item.thumbnail || "",
      sourcePage: item.foreign_landing_url || item.detail_url || "",
      title: clean(item.title),
      creator: clean(item.creator),
      license: clean(item.license),
      licenseUrl: clean(item.license_url),
      provider: clean(item.provider)
    }))
    .filter(item => item.imageUrl);
}

async function downloadImage(url, destination) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "BuildMitraImageFetcher/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error("URL did not return an image");
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 5000) {
    throw new Error("Image file too small");
  }

  const result = await sharp(buffer)
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true
    })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 84 })
    .toFile(destination);

  if (result.width < 250 || result.height < 250) {
    fs.unlinkSync(destination);
    throw new Error(`Image too small: ${result.width}x${result.height}`);
  }

  return result;
}

(async () => {
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(raw);
  const headers = rows[0].map(clean);

  const findColumn = (...names) => {
    for (const name of names) {
      const index = headers.findIndex(
        h => h.toLowerCase() === name.toLowerCase()
      );
      if (index >= 0) return index;
    }
    return -1;
  };

  const codeIndex = findColumn("Master Code", "MasterCode");
  const itemIndex = findColumn("Item Name", "ItemName");
  const brandIndex = findColumn("Brand/Short Code", "Brand", "Brand Name");
  const specIndex = findColumn("Specification");
  const categoryIndex = findColumn("Category");
  const subCategoryIndex = findColumn("Sub Category", "SubCategory");

  if (codeIndex < 0 || itemIndex < 0) {
    console.error("Required CSV columns missing: Master Code and Item Name");
    process.exit(1);
  }

  const report = [
    [
      "Row",
      "Master Code",
      "Item Name",
      "Search Query",
      "Status",
      "Output File",
      "Source Page",
      "Image URL",
      "Creator",
      "License",
      "License URL",
      "Error"
    ]
  ];

  const selected = rows.slice(1, limit + 1);
  const usedImageUrls = new Set();

  for (let index = 0; index < selected.length; index++) {
    const row = selected[index];

    const code = clean(row[codeIndex]);
    const item = clean(row[itemIndex]);
    const brand = brandIndex >= 0 ? clean(row[brandIndex]) : "";
    const spec = specIndex >= 0 ? clean(row[specIndex]) : "";
    const category = categoryIndex >= 0 ? clean(row[categoryIndex]) : "";
    const subCategory =
      subCategoryIndex >= 0 ? clean(row[subCategoryIndex]) : "";

    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const sizeMatch = item.match(
      /(\d+\s*\/\s*\d+|\d+(?:\.\d+)?)\s*(mm|cm|inch|inches|ft|")/i
    );

    let normalizedSize = "";
    let itemWithoutSize = item;

    if (sizeMatch) {
      const sizeNumber = sizeMatch[1].replace(/\s*\/\s*/g, "/");
      const sizeUnit =
        sizeMatch[2] === '"' ? "inch" : sizeMatch[2].toLowerCase();

      normalizedSize = `${sizeNumber} ${sizeUnit}`;
      itemWithoutSize = item.replace(sizeMatch[0], " ");
    }

    const baseItem = itemWithoutSize
      .replace(escapedBrand ? new RegExp(escapedBrand, "gi") : /$^/, " ")
      .replace(/\s*-\s*[A-Za-z][A-Za-z0-9 ]*$/i, " ")
      .replace(/["'/-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const searchQueries = [
      [brand, baseItem, normalizedSize].filter(Boolean).join(" "),
      [baseItem, normalizedSize].filter(Boolean).join(" "),
      [brand, baseItem].filter(Boolean).join(" "),
      baseItem,
      [subCategory, category].filter(Boolean).join(" "),
      category
    ]
      .map(value => value.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .filter((value, position, array) => array.indexOf(value) === position);

    const query = searchQueries.join(" | ");

    const outputFile = path.join(outputDir, safeName(code));

    let status = "";
    let sourcePage = "";
    let imageUrl = "";
    let creator = "";
    let license = "";
    let licenseUrl = "";
    let error = "";

    if (fs.existsSync(outputFile) && fs.statSync(outputFile).size > 5000) {
      status = "SkippedExisting";
      console.log(`[${index + 1}/${selected.length}] SKIP ${code}`);
    } else {
      try {
        let candidates = [];

        for (const searchQuery of searchQueries) {
          candidates = await searchOpenverse(searchQuery);

          if (candidates.length) {
            console.log(`  Search matched: ${searchQuery}`);
            break;
          }
        }

        if (!candidates.length) {
          status = "NoCandidate";
          console.log(`[${index + 1}/${selected.length}] NONE ${code}`);
        } else {
          let downloaded = false;

          for (const candidate of candidates.slice(0, 15)) {
            if (usedImageUrls.has(candidate.imageUrl)) {
              continue;
            }

            try {
              await downloadImage(candidate.imageUrl, outputFile);

              status = "DownloadedPendingReview";
              sourcePage = candidate.sourcePage;
              imageUrl = candidate.imageUrl;
              creator = candidate.creator;
              license = candidate.license;
              licenseUrl = candidate.licenseUrl;
              downloaded = true;
              usedImageUrls.add(candidate.imageUrl);

              console.log(
                `[${index + 1}/${selected.length}] OK ${code} - ${searchQueries[0]}`
              );
              break;
            } catch (candidateError) {
              error = candidateError.message;
            }
          }

          if (!downloaded) {
            status = "DownloadFailed";
            console.log(
              `[${index + 1}/${selected.length}] FAIL ${code}: ${error}`
            );
          }
        }
      } catch (searchError) {
        status = "SearchFailed";
        error = searchError.message;
        console.log(
          `[${index + 1}/${selected.length}] ERROR ${code}: ${error}`
        );
      }
    }

    report.push([
      index + 1,
      code,
      item,
      query,
      status,
      outputFile,
      sourcePage,
      imageUrl,
      creator,
      license,
      licenseUrl,
      error
    ]);

    fs.writeFileSync(
      reportPath,
      report.map(line => line.map(csvEscape).join(",")).join("\r\n"),
      "utf8"
    );

    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log("");
  console.log("Finished.");
  console.log("Images:", path.resolve(outputDir));
  console.log("Report:", path.resolve(reportPath));
  console.log("Review every image before uploading.");
})();




