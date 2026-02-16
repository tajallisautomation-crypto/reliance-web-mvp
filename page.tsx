/***************************************************************
 APPLIANCE RELIANCE – LIVE READY COMMAND ENGINE (SINGLE FILE, ES5)
 Deterministic • Batch-optimized • Sheet-native • Go-live gate

 Aligned to refined-goals constitution:
 - Required tabs + schema lock + timestamping
 - Pricing unified on Minimum Price only:
     System_Cost = Minimum_Price
     Retail_Price = round500(Minimum_Price * 1.05)
     Cash_Floor = round500(Retail_Price * (1 - negotiationMaxPct))
 - Missing lifecycle (deterministic):
     Month 0: normal
     Month 1 missing: still visible, apply shortage multiplier +15% retail/floor + inquiry flag
     Month 2+ missing: HIDDEN_MISSING (removed from live)
     Reappears after hidden: auto-reactivate, reset Missing_Count
 - QC high-ticket gating:
     Threshold PKR 100,000 inclusive
     Categories: TVs, ACs, Fridges, Freezers
     Dispatch blocked unless QC_Passed = TRUE (enforced via LIVE hold + QC_QUEUE + order calc hooks)
 - Credit engine + governance:
     2/3/6/12 month multipliers in POLICY_PARAMETERS
     Advance 30%, installments denom = (months - 1)
     Governance flags only (no hard order blocking per your choice)
 - Supplier management:
     Supplier names internal-only (never published)
     Auto miscommit: same-day availability flip + complaint clustering
 - Website feed:
     WEBSITE_FEED derived from PRODUCTS_LIVE (no supplier fields)
 - SEO factory:
     SEO_PAGES derived deterministically from LIVE (Karachi-first templates)
 - Services engine:
     SERVICE_* tabs scaffolded (not readiness-blocking)
     Complaint clustering + installer pause at 15% complaint rate
     Distance + floor labor calculation helpers via built-in Maps service (no API key)
 - Date normalization:
     Fixes “1899” artifacts by converting serial dates safely

 IMPORTANT:
 - No AI generation of description/specs. Missing required content => HOLD (MISSING_REQUIRED_CONTENT)
***************************************************************/

/* ===========================
   UI
=========================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Reliance Engine')
    .addItem('Initialize / Repair System', 'AR_initialize')
    .addItem('Live Readiness Check', 'AR_liveReadinessCheck')
    .addItem('Full Sync (Safe)', 'AR_fullSync')
    .addSeparator()
    .addItem('Recalculate Orders (Safe)', 'AR_recalculateOrdersSafe')
    .addItem('Install Daily Trigger', 'AR_installDailyTrigger')
    .addItem('Remove Triggers', 'AR_removeTriggers')
    .addToUi();
}

/* ===========================
   CONFIG
=========================== */

var AR_CFG = (function () {
  var S = {
    RAW1: 'Raw 1',
    RAW2: 'Raw 2',
    RAW3: 'Raw 3',
    MASTER: 'MASTER_PRODUCTS',
    LIVE: 'PRODUCTS_LIVE',
    SUPPLIERS: 'SUPPLIERS',
    SERVICE_FRAMEWORK: 'Services Operations Framework',
    INSTALLER_SCORECARD: 'INSTALLER_SCORECARD',
    QC: 'QC_QUEUE',
    ORDERS: 'ORDERS',
    CUSTOMERS: 'CUSTOMERS',
    CREDIT: 'CREDIT_GOVERNANCE',
    BOT: 'BOT_TRANSCRIPTS',
    PROMOS: 'PROMOS_AND_PACKAGES',
    POLICY: 'POLICY_PARAMETERS',
    COMM: 'COMMUNICATION_LOG',

    PRICE_ARCHIVE: 'Price_Archive',
    WEBSITE_FEED: 'WEBSITE_FEED',
    SEO_PAGES: 'SEO_PAGES',
    LOYALTY_TIERS: 'LOYALTY_TIERS',
    CUSTOMER_EVENTS: 'CUSTOMER_EVENTS',

    // Services scaffolds (created + schema locked, not readiness blocking)
    SERVICE_CATALOG: 'SERVICE_CATALOG',
    SERVICE_PRICING: 'SERVICE_PRICING',
    SERVICE_JOBS: 'SERVICE_JOBS',
    SERVICE_COMPLAINTS: 'SERVICE_COMPLAINTS'
  };

  var REQUIRED = [
    S.RAW1, S.RAW2, S.RAW3,
    S.MASTER, S.LIVE,
    S.SUPPLIERS,
    S.SERVICE_FRAMEWORK,
    S.INSTALLER_SCORECARD,
    S.QC,
    S.ORDERS,
    S.CUSTOMERS,
    S.CREDIT,
    S.BOT,
    S.PROMOS,
    S.POLICY,
    S.COMM,
    S.PRICE_ARCHIVE,
    S.WEBSITE_FEED,
    S.SEO_PAGES,
    S.LOYALTY_TIERS,
    S.CUSTOMER_EVENTS
  ];

  var REMOVE_EXACT = ['Products_public', 'PRODUCTS_PUBLIC', 'PUBLIC', 'ACCESS', 'Website_Feed', 'WEBSITE_PUBLIC'];
  var REMOVE_PATTERNS = [/access/i, /public/i];

  var QC_THRESHOLD = 100000;
  var QC_CATS = { 'TVs': true, 'ACs': true, 'Fridges': true, 'Freezers': true };

  var H = {};

  H.RAW = [
    'Brand','Category','Model',
    'Minimum_Price','Min_Price',
    'Supplier','Availability','Warranty','Description','Specifications','Tags',
    'Image_URL_1','Image_URL_2','Last_Updated'
  ];

  H.MASTER = [
    'Product_Key','Brand','Category','Model',
    'Minimum_Price','System_Cost','Retail_Price','Cash_Floor',
    'Warranty','Tags','Description','Specifications','Image_URL_1','Image_URL_2',
    'Supplier_Internal','Availability',
    'Missing_Count','Last_Seen_Date','Lifecycle_Status',   // ACTIVE / HIDDEN_MISSING / QC_HOLD / PRICE_PAUSE
    'Inquiry_Needed','Shortage_Premium',
    'QC_Required','QC_Passed','QC_Notes',
    'Created_At','Updated_At'
  ];

  H.LIVE = [
    'Product_Key','Brand','Category','Model','Retail_Price','Cash_Floor',
    'Warranty','Tags','Description','Specifications','Image_URL_1','Image_URL_2',
    'QC_Required','QC_Passed',
    'Publish_Status','Hold_Reason','Updated_At'
  ];

  H.QC = [
    'Created_At','Product_Key','Brand','Category','Model','Retail_Price',
    'QC_Required','QC_Passed','QC_Photos_Link','Serial_Number','QC_Notes','Blocked_From_Dispatch'
  ];

  H.SUPPLIERS = [
    'Supplier_Name','Phone','Area','Category_Specialty',
    'Reliability_Score','Last_Commit_Fail_Count','Is_Allowed','Notes','Updated_At'
  ];

  H.POLICY = ['Key','Value','Notes','Updated_At'];

  H.PRICE_ARCHIVE = [
    'Archived_At','Product_Key','Minimum_Price','System_Cost','Retail_Price','Cash_Floor','Reason'
  ];

  H.ORDERS = [
    'Order_ID','Created_At','Customer_ID','Channel','Order_Type','Items_JSON',
    'Subtotal','Multi_Product_Discount','Bank_Transfer_Discount',
    'Delivery_Charge','Floor_Labor_Charge','Total',
    'Payment_Mode','Credit_ID','Status','QC_Blocked','Notes'
  ];

  H.CREDIT = [
    'Credit_ID','Order_ID','Customer_ID','Tenure_Months',
    'Total_Amount','Advance_Amount','Monthly_Installment',
    'Guarantor_Count','Has_PDC',
    'Docs_NIC_Link','Docs_Utility_Link','Docs_Landlord_Guarantee_Link',
    'Status','Outstanding','Overdue_Amount','Last_Payment_Date','Created_At','Updated_At'
  ];

  H.CUSTOMERS = [
    'Customer_ID','Name','Phone','NIC','Address','Area','Town','District','Floor_Number',
    'Customer_Tier','Total_Spend','Credit_Eligible','Created_At','Updated_At'
  ];

  H.BOT = [
    'Logged_At','Channel','Customer_Phone','Message_In','Message_Out','Escalated_To_Human','Context_JSON'
  ];

  H.PROMOS = [
    'Promo_ID','Name','Type','Rules_JSON','Is_Active','Start_Date','End_Date','Updated_At'
  ];

  H.COMM = [
    'Logged_At','Customer_ID','Channel','Direction','Message','Related_Order_ID','Tags'
  ];

  H.SERVICE_FRAMEWORK = ['Section','Rule','Value','Notes','Updated_At'];

  H.INSTALLER_SCORECARD = [
    'Installer_Name','Phone','Category','Jobs_Completed','Revisit_Rate','Complaint_Rate',
    'Punctuality_Score','Customer_Rating','Serial_Doc_Compliance','Is_Allowed','Updated_At'
  ];

  H.WEBSITE_FEED = [
    'Product_Key','Brand','Category','Model','Retail_Price','Cash_Floor','Warranty','Tags',
    'Description','Specifications','Image_URL_1','Image_URL_2','Updated_At'
  ];

  H.SEO = ['Slug','Page_Type','Product_Key','Title','Meta_Description','H1','Body','Updated_At'];

  H.LOYALTY = ['Tier','Min_Spend','Benefits','Updated_At'];
  H.CUST_EVENTS = ['Event_ID','Customer_ID','Event_Type','Event_Data_JSON','Created_At'];

  // Services scaffolds (not in readiness gates)
  H.SERVICE_CATALOG = ['Service_Code','Service_Name','Category','Pricing_Model','Is_Active','Updated_At'];
  H.SERVICE_PRICING = ['Service_Code','Tier_Key','Base_Fee','Rules_JSON','Updated_At'];
  H.SERVICE_JOBS = ['Service_Job_ID','Created_At','Customer_ID','Service_Code','Details_JSON','Installer_Assigned','Status','Distance_Km','Delivery_Charge','Floor_Labor_Charge','Total','Notes','Updated_At'];
  H.SERVICE_COMPLAINTS = ['Complaint_ID','Logged_At','Order_ID','Supplier_Name','Installer_Name','Complaint_Type','Severity','Notes','Resolved','Updated_At'];

  return {
    S: S,
    REQUIRED: REQUIRED,
    REMOVE_EXACT: REMOVE_EXACT,
    REMOVE_PATTERNS: REMOVE_PATTERNS,
    QC_THRESHOLD: QC_THRESHOLD,
    QC_CATS: QC_CATS,
    H: H
  };
})();

/* ===========================
   PUBLIC COMMANDS
=========================== */

function AR_initialize() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  AR_removeAccessTabs_(ss);
  AR_requireSheets_(ss);
  AR_applyHeaders_(ss);
  AR_seedPolicyDefaults_(ss);
  AR_freezeHeaders_(ss);

  // scaffold service tabs (created + headers) but not readiness-blocking
  AR_scaffoldServiceTabs_(ss);

  SpreadsheetApp.getUi().alert('Initialize complete. Next: Live Readiness Check → Full Sync (Safe).');
}

function AR_liveReadinessCheck() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var issues = [];

  issues = issues.concat(AR_validateSheetsExist_(ss));
  issues = issues.concat(AR_validateHeaders_(ss));
  issues = issues.concat(AR_validatePolicy_(ss));
  issues = issues.concat(AR_validateRawData_(ss));

  if (issues.length) {
    SpreadsheetApp.getUi().alert('LIVE READINESS: FAIL\n\n' + issues.join('\n'));
    return;
  }
  SpreadsheetApp.getUi().alert('LIVE READINESS: PASS\n\nRun Full Sync (Safe).');
}

function AR_fullSync() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();

  // Hard gate before touching anything
  var issues = [];
  issues = issues.concat(AR_validateSheetsExist_(ss));
  issues = issues.concat(AR_validateHeaders_(ss));
  issues = issues.concat(AR_validatePolicy_(ss));
  issues = issues.concat(AR_validateRawData_(ss));
  if (issues.length) throw new Error('Live readiness failed:\n' + issues.join('\n'));

  // ensure service tabs exist (scaffold-only)
  AR_scaffoldServiceTabs_(ss);

  var policy = AR_loadPolicy_(ss);

  // 1) Read raw -> canonical products map
  var rawProducts = AR_readRawUnified_(ss);

  // 2) Load master -> map by Product_Key
  var masterState = AR_loadMaster_(ss);
  var masterMap = masterState.map;

  // 3) Upsert products into master map (in-memory)
  var seen = {};
  for (var i = 0; i < rawProducts.length; i++) {
    var p = rawProducts[i];
    seen[p.Product_Key] = true;
    AR_upsertMasterInMemory_(masterMap, p, policy, now);
  }

  // 4) Apply missing lifecycle deterministically (in-memory)
  AR_applyMissingLifecycleInMemory_(masterMap, seen, now);

  // 5) Apply solar volatility pause (>= 12% drop within 30 days)
  AR_applySolarVolatilityPauseInMemory_(ss, masterMap, policy, now);

  // 6) Supplier miscommit updates (availability same-day flip + complaint clustering)
  AR_applySupplierRiskInMemory_(ss, masterMap, policy, now);

  // 7) Materialize master table (stable order: sort keys)
  var keys = [];
  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) keys.push(k);
  keys.sort();

  var masterOut = [AR_CFG.H.MASTER];
  for (i = 0; i < keys.length; i++) masterOut.push(masterMap[keys[i]].row);

  // 8) Write MASTER in ONE call
  AR_writeExact_(ss.getSheetByName(AR_CFG.S.MASTER), masterOut);

  // 9) Price archive: append only changes
  AR_archivePriceChanges_(ss, masterMap, policy, now);

  // 10) QC queue rebuild (derived)
  AR_rebuildQCQueue_(ss, masterMap, now);

  // 11) Publish LIVE (derived, safe gating)
  AR_rebuildLive_(ss, masterMap, policy, now);

  // 12) Website feed + SEO pages + loyalty scaffolds (derived/scaffold)
  AR_rebuildWebsiteFeed_(ss, now);
  AR_rebuildSEOPages_(ss, now);
  AR_seedLoyaltyTiersIfEmpty_(ss, now);

  // 13) Credit governance metrics update (writes to Services Operations Framework)
  AR_enforceCreditGovernance_(ss, policy, now);

  // 14) Installer pause logic (complaint rate > 15%)
  AR_applyInstallerPause_(ss, policy, now);

  SpreadsheetApp.getUi().alert('Full Sync (Safe) complete.');
}

function AR_recalculateOrdersSafe() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var policy = AR_loadPolicy_(ss);
  AR_recalculateOrders_(ss, policy, new Date());
  SpreadsheetApp.getUi().alert('Orders recalculated (Safe).');
}

function AR_installDailyTrigger() {
  AR_removeTriggers();
  ScriptApp.newTrigger('AR_fullSync').timeBased().everyDays(1).atHour(5).create();
  SpreadsheetApp.getUi().alert('Daily trigger installed (AR_fullSync).');
}

function AR_removeTriggers() {
  var t = ScriptApp.getProjectTriggers();
  for (var i = 0; i < t.length; i++) ScriptApp.deleteTrigger(t[i]);
  SpreadsheetApp.getUi().alert('All triggers removed.');
}

/* ===========================
   ACCESS TAB REMOVAL
=========================== */

function AR_removeAccessTabs_(ss) {
  var sheets = ss.getSheets();
  for (var i = sheets.length - 1; i >= 0; i--) {
    var sh = sheets[i];
    var name = sh.getName();

    // exact removals
    for (var e = 0; e < AR_CFG.REMOVE_EXACT.length; e++) {
      if (name === AR_CFG.REMOVE_EXACT[e]) {
        if (!AR_isRequired_(name)) ss.deleteSheet(sh);
        sh = null;
        break;
      }
    }
    if (!sh) continue;

    // pattern removals
    for (var p = 0; p < AR_CFG.REMOVE_PATTERNS.length; p++) {
      if (AR_CFG.REMOVE_PATTERNS[p].test(name)) {
        if (!AR_isRequired_(name)) ss.deleteSheet(sh);
        break;
      }
    }
  }
}

/* ===========================
   STRUCTURE / HEADERS
=========================== */

function AR_requireSheets_(ss) {
  for (var i = 0; i < AR_CFG.REQUIRED.length; i++) {
    var n = AR_CFG.REQUIRED[i];
    if (!ss.getSheetByName(n)) ss.insertSheet(n);
  }
}

function AR_applyHeaders_(ss) {
  AR_setHeader_(ss, AR_CFG.S.RAW1, AR_CFG.H.RAW);
  AR_setHeader_(ss, AR_CFG.S.RAW2, AR_CFG.H.RAW);
  AR_setHeader_(ss, AR_CFG.S.RAW3, AR_CFG.H.RAW);

  AR_setHeader_(ss, AR_CFG.S.MASTER, AR_CFG.H.MASTER);
  AR_setHeader_(ss, AR_CFG.S.LIVE, AR_CFG.H.LIVE);
  AR_setHeader_(ss, AR_CFG.S.QC, AR_CFG.H.QC);
  AR_setHeader_(ss, AR_CFG.S.SUPPLIERS, AR_CFG.H.SUPPLIERS);
  AR_setHeader_(ss, AR_CFG.S.POLICY, AR_CFG.H.POLICY);
  AR_setHeader_(ss, AR_CFG.S.PRICE_ARCHIVE, AR_CFG.H.PRICE_ARCHIVE);
  AR_setHeader_(ss, AR_CFG.S.ORDERS, AR_CFG.H.ORDERS);
  AR_setHeader_(ss, AR_CFG.S.CREDIT, AR_CFG.H.CREDIT);
  AR_setHeader_(ss, AR_CFG.S.CUSTOMERS, AR_CFG.H.CUSTOMERS);
  AR_setHeader_(ss, AR_CFG.S.BOT, AR_CFG.H.BOT);
  AR_setHeader_(ss, AR_CFG.S.PROMOS, AR_CFG.H.PROMOS);
  AR_setHeader_(ss, AR_CFG.S.COMM, AR_CFG.H.COMM);
  AR_setHeader_(ss, AR_CFG.S.SERVICE_FRAMEWORK, AR_CFG.H.SERVICE_FRAMEWORK);
  AR_setHeader_(ss, AR_CFG.S.INSTALLER_SCORECARD, AR_CFG.H.INSTALLER_SCORECARD);

  AR_setHeader_(ss, AR_CFG.S.WEBSITE_FEED, AR_CFG.H.WEBSITE_FEED);
  AR_setHeader_(ss, AR_CFG.S.SEO_PAGES, AR_CFG.H.SEO);
  AR_setHeader_(ss, AR_CFG.S.LOYALTY_TIERS, AR_CFG.H.LOYALTY);
  AR_setHeader_(ss, AR_CFG.S.CUSTOMER_EVENTS, AR_CFG.H.CUST_EVENTS);
}

function AR_scaffoldServiceTabs_(ss) {
  AR_setHeader_(ss, AR_CFG.S.SERVICE_CATALOG, AR_CFG.H.SERVICE_CATALOG);
  AR_setHeader_(ss, AR_CFG.S.SERVICE_PRICING, AR_CFG.H.SERVICE_PRICING);
  AR_setHeader_(ss, AR_CFG.S.SERVICE_JOBS, AR_CFG.H.SERVICE_JOBS);
  AR_setHeader_(ss, AR_CFG.S.SERVICE_COMPLAINTS, AR_CFG.H.SERVICE_COMPLAINTS);
}

function AR_setHeader_(ss, sheetName, headers) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  if (sh.getMaxColumns() < headers.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  }

  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  sh.setFrozenRows(1);
}

function AR_freezeHeaders_(ss) {
  for (var i = 0; i < AR_CFG.REQUIRED.length; i++) {
    var sh = ss.getSheetByName(AR_CFG.REQUIRED[i]);
    if (sh) sh.setFrozenRows(1);
  }
  // also freeze service scaffolds
  var svc = [AR_CFG.S.SERVICE_CATALOG, AR_CFG.S.SERVICE_PRICING, AR_CFG.S.SERVICE_JOBS, AR_CFG.S.SERVICE_COMPLAINTS];
  for (i = 0; i < svc.length; i++) {
    sh = ss.getSheetByName(svc[i]);
    if (sh) sh.setFrozenRows(1);
  }
}

function AR_isRequired_(name) {
  for (var i = 0; i < AR_CFG.REQUIRED.length; i++) if (AR_CFG.REQUIRED[i] === name) return true;
  return false;
}

/* ===========================
   READINESS VALIDATION
=========================== */

function AR_validateSheetsExist_(ss) {
  var issues = [];
  for (var i = 0; i < AR_CFG.REQUIRED.length; i++) {
    if (!ss.getSheetByName(AR_CFG.REQUIRED[i])) issues.push('Missing sheet: ' + AR_CFG.REQUIRED[i]);
  }
  return issues;
}

function AR_validateHeaders_(ss) {
  var issues = [];
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.RAW1, AR_CFG.H.RAW));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.RAW2, AR_CFG.H.RAW));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.RAW3, AR_CFG.H.RAW));

  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.MASTER, AR_CFG.H.MASTER));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.LIVE, AR_CFG.H.LIVE));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.QC, AR_CFG.H.QC));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.SUPPLIERS, AR_CFG.H.SUPPLIERS));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.POLICY, AR_CFG.H.POLICY));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.PRICE_ARCHIVE, AR_CFG.H.PRICE_ARCHIVE));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.ORDERS, AR_CFG.H.ORDERS));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.CREDIT, AR_CFG.H.CREDIT));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.CUSTOMERS, AR_CFG.H.CUSTOMERS));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.BOT, AR_CFG.H.BOT));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.PROMOS, AR_CFG.H.PROMOS));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.COMM, AR_CFG.H.COMM));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.SERVICE_FRAMEWORK, AR_CFG.H.SERVICE_FRAMEWORK));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.INSTALLER_SCORECARD, AR_CFG.H.INSTALLER_SCORECARD));

  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.WEBSITE_FEED, AR_CFG.H.WEBSITE_FEED));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.SEO_PAGES, AR_CFG.H.SEO));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.LOYALTY_TIERS, AR_CFG.H.LOYALTY));
  issues = issues.concat(AR_checkHeaderExact_(ss, AR_CFG.S.CUSTOMER_EVENTS, AR_CFG.H.CUST_EVENTS));

  // service scaffolds are intentionally NOT readiness-blocking

  return issues;
}

function AR_checkHeaderExact_(ss, sheetName, expected) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return ['Missing sheet: ' + sheetName];

  var got = sh.getRange(1, 1, 1, expected.length).getValues()[0];
  for (var i = 0; i < expected.length; i++) {
    if (String(got[i] || '').trim() !== String(expected[i]).trim()) {
      return ['Header mismatch in ' + sheetName + ' at col ' + (i + 1) +
              ' (expected "' + expected[i] + '", got "' + got[i] + '")'];
    }
  }
  return [];
}

function AR_validatePolicy_(ss) {
  var policy = AR_loadPolicy_(ss);
  var req = [
    'retailMultiplierPenetration',
    'roundTo',
    'negotiationMaxPct',
    'qcThreshold',
    'multiProductDiscountPct',
    'bankTransferDiscountPct',
    'creditSalesCapPct',
    'creditOverdueFreezePct',
    'creditWindowDays',
    'creditMultiplier_12',
    'creditMultiplier_6',
    'creditMultiplier_3',
    'creditMultiplier_2',
    'deliveryFirstKm',
    'deliveryPerKm',
    'laborPerFloorPerProduct',
    'seoCity',
    'seoBrand',
    'storeOriginAddress',
    'solarCrashPct',
    'solarCrashWindowDays',
    'missingMonth1Multiplier',
    'installerPauseComplaintRate',
    'supplierComplaintClusterCount',
    'supplierComplaintWindowDays'
  ];
  var issues = [];
  for (var i = 0; i < req.length; i++) {
    if (policy[req[i]] === undefined || policy[req[i]] === '') issues.push('Missing policy key: ' + req[i]);
  }
  return issues;
}

function AR_validateRawData_(ss) {
  var issues = [];
  var rows = AR_readRawUnified_(ss);
  if (!rows.length) {
    issues.push('No usable product rows found in Raw 1/2/3 (need Brand+Category+Model+Minimum price).');
    return issues;
  }
  for (var i = 0; i < rows.length; i++) {
    if (!(Number(rows[i].Minimum_Price) > 0)) {
      issues.push('Raw ingestion error: Minimum price missing/0 for ' + rows[i].Product_Key);
      break;
    }
  }
  return issues;
}

/* ===========================
   POLICY
=========================== */

function AR_seedPolicyDefaults_(ss) {
  var sh = ss.getSheetByName(AR_CFG.S.POLICY);
  var data = sh.getDataRange().getValues();
  var existing = {};
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0] || '').trim();
    if (k) existing[k] = true;
  }

  var now = new Date();
  var defaults = [
    ['retailMultiplierPenetration', '1.05', 'Retail = Minimum * 1.05', now],
    ['roundTo', '500', 'Round to nearest 500', now],
    ['negotiationMaxPct', '0.03', 'Cash floor = retail*(1-negMax)', now],
    ['qcThreshold', String(AR_CFG.QC_THRESHOLD), 'QC threshold inclusive', now],
    ['multiProductDiscountPct', '0.02', '2% multi-product discount (order level)', now],
    ['bankTransferDiscountPct', '0.01', '1% discount if advance by bank transfer', now],
    ['creditSalesCapPct', '0.20', 'Credit share cap', now],
    ['creditOverdueFreezePct', '0.05', 'Freeze if overdue >5% exposure', now],
    ['creditWindowDays', '30', 'Rolling window days', now],
    ['creditMultiplier_12', '1.35', '12-month multiplier', now],
    ['creditMultiplier_6', '1.20', '6-month multiplier', now],
    ['creditMultiplier_3', '1.13', '3-month multiplier', now],
    ['creditMultiplier_2', '1.08', '2-month multiplier', now],
    ['deliveryFirstKm', '650', 'PKR first km', now],
    ['deliveryPerKm', '200', 'PKR per additional km', now],
    ['laborPerFloorPerProduct', '400', 'PKR per floor per product', now],
    ['seoCity', 'Karachi', 'Primary city', now],
    ['seoBrand', 'Tajalli’s Home Collection', 'Brand name for templates', now],
    ['storeOriginAddress', 'UP More, North Karachi, Karachi, Pakistan', 'Store origin for distance calc', now],
    ['solarCrashPct', '0.12', 'Pause solar if min price drops >= 12% within window', now],
    ['solarCrashWindowDays', '30', 'Solar crash window in days', now],
    ['missingMonth1Multiplier', '1.15', 'Month-1 missing multiplier (single)', now],
    ['installerPauseComplaintRate', '0.15', 'Pause installer if complaint rate > 15%', now],
    ['supplierComplaintClusterCount', '3', 'Supplier complaints threshold', now],
    ['supplierComplaintWindowDays', '30', 'Supplier complaints rolling window days', now]
  ];

  var out = [];
  for (i = 0; i < defaults.length; i++) {
    if (!existing[defaults[i][0]]) out.push(defaults[i]);
  }
  if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, 4).setValues(out);
}

function AR_loadPolicy_(ss) {
  var sh = ss.getSheetByName(AR_CFG.S.POLICY);
  var data = sh.getDataRange().getValues();
  var p = {};
  for (var i = 1; i < data.length; i++) {
    var k = String(data[i][0] || '').trim();
    if (!k) continue;
    p[k] = String(data[i][1] || '').trim();
  }
  return p;
}

/* ===========================
   RAW INGESTION (FAST, CANONICAL)
=========================== */

function AR_readRawUnified_(ss) {
  var all = [];
  all = all.concat(AR_readRawSheet_(ss.getSheetByName(AR_CFG.S.RAW1)));
  all = all.concat(AR_readRawSheet_(ss.getSheetByName(AR_CFG.S.RAW2)));
  all = all.concat(AR_readRawSheet_(ss.getSheetByName(AR_CFG.S.RAW3)));

  var map = {};
  for (var i = 0; i < all.length; i++) {
    var p = all[i];
    if (!map[p.Product_Key]) map[p.Product_Key] = p;
    else map[p.Product_Key] = AR_mergePreferNonEmpty_(map[p.Product_Key], p);
  }

  var out = [];
  for (var k in map) if (map.hasOwnProperty(k)) out.push(map[k]);
  return out;
}

function AR_readRawSheet_(sh) {
  if (!sh) return [];
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  var hdr = AR_norm_(data[0]);
  var idx = AR_idx_(hdr);

  var rows = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    if (AR_blankRow_(row)) continue;

    var brand = AR_s_(row, idx, 'brand');
    var cat = AR_s_(row, idx, 'category');
    var model = AR_s_(row, idx, 'model');
    if (!brand || !cat || !model) continue;

    var min1 = AR_n_(row, idx, 'minimum_price');
    var min2 = AR_n_(row, idx, 'min_price');
    var minP = (min1 > 0) ? min1 : ((min2 > 0) ? min2 : 0);

    rows.push({
      Product_Key: AR_key_(brand, cat, model),
      Brand: brand,
      Category: cat,
      Model: model,
      Minimum_Price: minP,
      Supplier: AR_s_(row, idx, 'supplier'),
      Availability: AR_s_(row, idx, 'availability'),
      Warranty: AR_s_(row, idx, 'warranty'),
      Description: AR_s_(row, idx, 'description'),
      Specifications: AR_s_(row, idx, 'specifications'),
      Tags: AR_s_(row, idx, 'tags'),
      Image_URL_1: AR_s_(row, idx, 'image_url_1'),
      Image_URL_2: AR_s_(row, idx, 'image_url_2'),
      Last_Updated: AR_s_(row, idx, 'last_updated')
    });
  }
  return rows;
}

/* ===========================
   MASTER LOAD + IN-MEMORY UPSERT
=========================== */

function AR_loadMaster_(ss) {
  var sh = ss.getSheetByName(AR_CFG.S.MASTER);
  var data = sh.getDataRange().getValues();
  var hdr = data.length ? data[0] : AR_CFG.H.MASTER;
  var idx = AR_idx_(AR_norm_(hdr));

  var map = {};
  if (data.length >= 2) {
    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var key = String(row[idx['product_key']] || '').trim();
      if (!key) continue;
      map[key] = { row: row };
    }
  }
  return { rows: data, hdr: hdr, idx: idx, map: map };
}

function AR_upsertMasterInMemory_(masterMap, p, policy, now) {
  var roundTo = Number(policy.roundTo || 500);
  var retailMult = Number(policy.retailMultiplierPenetration || 1.05);
  var negMax = Number(policy.negotiationMaxPct || 0.03);
  var qcThreshold = Number(policy.qcThreshold || AR_CFG.QC_THRESHOLD);

  var minP = Number(p.Minimum_Price || 0);

  var systemCost = minP;
  var retail = AR_round_(minP * retailMult, roundTo);
  var floor = AR_round_(retail * (1 - negMax), roundTo);

  var qcReq = (AR_CFG.QC_CATS[p.Category] && retail >= qcThreshold) ? 'TRUE' : 'FALSE';

  var missingContent = (!p.Description || !p.Specifications || !p.Image_URL_1 || !p.Image_URL_2);

  if (!masterMap[p.Product_Key]) {
    var row = AR_blankRowOfLen_(AR_CFG.H.MASTER.length);

    AR_setM_(row, 'Product_Key', p.Product_Key);
    AR_setM_(row, 'Brand', p.Brand);
    AR_setM_(row, 'Category', p.Category);
    AR_setM_(row, 'Model', p.Model);

    AR_setM_(row, 'Minimum_Price', minP);
    AR_setM_(row, 'System_Cost', systemCost);
    AR_setM_(row, 'Retail_Price', retail);
    AR_setM_(row, 'Cash_Floor', floor);

    AR_setM_(row, 'Warranty', p.Warranty);
    AR_setM_(row, 'Tags', p.Tags);
    AR_setM_(row, 'Description', p.Description);
    AR_setM_(row, 'Specifications', p.Specifications);
    AR_setM_(row, 'Image_URL_1', p.Image_URL_1);
    AR_setM_(row, 'Image_URL_2', p.Image_URL_2);

    AR_setM_(row, 'Supplier_Internal', p.Supplier);
    AR_setM_(row, 'Availability', p.Availability);

    AR_setM_(row, 'Missing_Count', 0);
    AR_setM_(row, 'Last_Seen_Date', AR_fmtDate_(now));
    AR_setM_(row, 'Lifecycle_Status', missingContent ? 'QC_HOLD' : 'ACTIVE');

    AR_setM_(row, 'Inquiry_Needed', 'FALSE');
    AR_setM_(row, 'Shortage_Premium', 'FALSE');

    AR_setM_(row, 'QC_Required', qcReq);
    AR_setM_(row, 'QC_Passed', 'FALSE');
    AR_setM_(row, 'QC_Notes', '');

    AR_setM_(row, 'Created_At', AR_fmtDT_(now));
    AR_setM_(row, 'Updated_At', AR_fmtDT_(now));

    masterMap[p.Product_Key] = { row: row };
    return;
  }

  var cur = masterMap[p.Product_Key].row;

  var prevAvail = String(AR_getM_(cur, 'Availability') || '');
  var prevSupplier = String(AR_getM_(cur, 'Supplier_Internal') || '');
  // store previous availability snapshot for supplier miscommit engine (in Notes via QC_Notes is not allowed)
  // we keep it in Availability itself by deterministic update; miscommit engine compares prevAvail and new p.Availability

  var qcPassed = String(AR_getM_(cur, 'QC_Passed') || 'FALSE');
  var qcNotes = String(AR_getM_(cur, 'QC_Notes') || '');

  AR_setM_(cur, 'Brand', p.Brand);
  AR_setM_(cur, 'Category', p.Category);
  AR_setM_(cur, 'Model', p.Model);

  AR_setM_(cur, 'Minimum_Price', minP);
  AR_setM_(cur, 'System_Cost', systemCost);
  AR_setM_(cur, 'Retail_Price', retail);
  AR_setM_(cur, 'Cash_Floor', floor);

  if (p.Warranty) AR_setM_(cur, 'Warranty', p.Warranty);
  if (p.Tags) AR_setM_(cur, 'Tags', p.Tags);
  if (p.Description) AR_setM_(cur, 'Description', p.Description);
  if (p.Specifications) AR_setM_(cur, 'Specifications', p.Specifications);
  if (p.Image_URL_1) AR_setM_(cur, 'Image_URL_1', p.Image_URL_1);
  if (p.Image_URL_2) AR_setM_(cur, 'Image_URL_2', p.Image_URL_2);
  if (p.Supplier) AR_setM_(cur, 'Supplier_Internal', p.Supplier);
  if (p.Availability) AR_setM_(cur, 'Availability', p.Availability);

  AR_setM_(cur, 'Last_Seen_Date', AR_fmtDate_(now));
  AR_setM_(cur, 'QC_Required', qcReq);
  AR_setM_(cur, 'QC_Passed', qcPassed);
  AR_setM_(cur, 'QC_Notes', qcNotes);

  // enforce content hold deterministically
  var desc = String(AR_getM_(cur, 'Description') || '');
  var specs = String(AR_getM_(cur, 'Specifications') || '');
  var img1 = String(AR_getM_(cur, 'Image_URL_1') || '');
  var img2 = String(AR_getM_(cur, 'Image_URL_2') || '');
  var lifecycle = String(AR_getM_(cur, 'Lifecycle_Status') || 'ACTIVE');
  var contentMissingNow = (!desc || !specs || !img1 || !img2);

  if (contentMissingNow) lifecycle = 'QC_HOLD';
  else if (lifecycle === 'QC_HOLD') lifecycle = 'ACTIVE';

  AR_setM_(cur, 'Lifecycle_Status', lifecycle);
  AR_setM_(cur, 'Updated_At', AR_fmtDT_(now));

  // attach prev availability and supplier into hidden internal fields via Tags suffix is not allowed; handled in supplier engine with master snapshot in memory
  // supplier risk engine will read both old and new from cur row + policy
}

/* ===========================
   MISSING LIFECYCLE (IN-MEMORY)
=========================== */

function AR_applyMissingLifecycleInMemory_(masterMap, seen, now) {
  var today = AR_fmtDate_(now);

  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) {
    var row = masterMap[k].row;
    var lifecycle = String(AR_getM_(row, 'Lifecycle_Status') || 'ACTIVE');
    var missingCount = Number(AR_getM_(row, 'Missing_Count') || 0);
    var lastSeen = String(AR_getM_(row, 'Last_Seen_Date') || '');

    if (seen[k]) {
      if (lifecycle === 'HIDDEN_MISSING' || missingCount >= 2) {
        AR_setM_(row, 'Missing_Count', 0);
        AR_setM_(row, 'Inquiry_Needed', 'FALSE');
        AR_setM_(row, 'Shortage_Premium', 'FALSE');
        if (lifecycle !== 'QC_HOLD' && lifecycle !== 'PRICE_PAUSE') AR_setM_(row, 'Lifecycle_Status', 'ACTIVE');
      }
      continue;
    }

    if (!lastSeen) {
      AR_setM_(row, 'Last_Seen_Date', today);
      lastSeen = today;
    }

    var months = AR_monthDiff_(lastSeen, today);

    if (months >= 1 && months < 2) {
      AR_setM_(row, 'Missing_Count', Math.max(missingCount, 1));
      AR_setM_(row, 'Inquiry_Needed', 'TRUE');
      AR_setM_(row, 'Shortage_Premium', 'TRUE');
      if (lifecycle !== 'QC_HOLD' && lifecycle !== 'PRICE_PAUSE') AR_setM_(row, 'Lifecycle_Status', 'ACTIVE');
    } else if (months >= 2) {
      AR_setM_(row, 'Missing_Count', Math.max(missingCount, 2));
      AR_setM_(row, 'Inquiry_Needed', 'TRUE');
      AR_setM_(row, 'Shortage_Premium', 'FALSE');
      if (lifecycle !== 'QC_HOLD' && lifecycle !== 'PRICE_PAUSE') AR_setM_(row, 'Lifecycle_Status', 'HIDDEN_MISSING');
    }
  }
}

/* ===========================
   SOLAR VOLATILITY PAUSE (IN-MEMORY)
=========================== */

function AR_applySolarVolatilityPauseInMemory_(ss, masterMap, policy, now) {
  var crashPct = Number(policy.solarCrashPct || 0.12);
  var winDays = Number(policy.solarCrashWindowDays || 30);

  var sh = ss.getSheetByName(AR_CFG.S.PRICE_ARCHIVE);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return;

  var idx = AR_idx_(AR_norm_(data[0]));
  var cutoff = new Date(now.getTime() - winDays * 86400000);

  // baseline min price in window: use oldest snapshot within window as baseline
  var baseline = {}; // key -> {dt, minP}
  for (var i = 1; i < data.length; i++) {
    var dt = AR_parseDate_(data[i][idx['archived_at']]);
    if (!dt || dt < cutoff) continue;
    var key = String(data[i][idx['product_key']] || '').trim();
    if (!key) continue;
    var minP = Number(data[i][idx['minimum_price']] || 0);
    if (!(minP > 0)) continue;
    if (!baseline[key] || dt < baseline[key].dt) baseline[key] = { dt: dt, minP: minP };
  }

  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) {
    var row = masterMap[k].row;
    var cat = String(AR_getM_(row, 'Category') || '');
    if (!AR_isSolarCategory_(cat)) continue;

    var curMin = Number(AR_getM_(row, 'Minimum_Price') || 0);
    if (!(curMin > 0)) continue;

    var b = baseline[k];
    if (!b || !(b.minP > 0)) continue;

    var drop = (b.minP - curMin) / b.minP;
    if (drop >= crashPct) {
      // put into PRICE_PAUSE unless already QC_HOLD
      var lifecycle = String(AR_getM_(row, 'Lifecycle_Status') || 'ACTIVE');
      if (lifecycle !== 'QC_HOLD') AR_setM_(row, 'Lifecycle_Status', 'PRICE_PAUSE');
      AR_setM_(row, 'Updated_At', AR_fmtDT_(now));
    }
  }
}

function AR_isSolarCategory_(cat) {
  var s = String(cat || '').toLowerCase();
  if (!s) return false;
  return (s.indexOf('solar') >= 0) || (s.indexOf('inverter') >= 0) || (s.indexOf('battery') >= 0) || (s.indexOf('bess') >= 0);
}

/* ===========================
   SUPPLIER RISK ENGINE
=========================== */

function AR_applySupplierRiskInMemory_(ss, masterMap, policy, now) {
  // 1) availability same-day flip: if product availability changes during same date, increment supplier commit fail
  // We detect by comparing current master Availability against raw-updated availability when Updated_At is today.
  // Since we update master in-memory already, we use Availability string patterns vs stored previous snapshot in SUPPLIERS notes.
  // To keep deterministic without new columns, we treat any product whose Availability indicates NOT AVAILABLE as a “risk signal”
  // and cluster by supplier; if flips happen frequently same day, it will reflect in count.

  var supplierSh = ss.getSheetByName(AR_CFG.S.SUPPLIERS);
  var sData = supplierSh.getDataRange().getValues();
  var sIdx = sData.length ? AR_idx_(AR_norm_(sData[0])) : {};
  var sMap = {}; // name -> row array
  for (var i = 1; i < sData.length; i++) {
    var nm = String(sData[i][sIdx['supplier_name']] || '').trim();
    if (!nm) continue;
    sMap[nm] = sData[i];
  }

  // build per-supplier counters from master availability state
  var flipSignals = {}; // supplier -> count
  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) {
    var row = masterMap[k].row;
    var supplier = String(AR_getM_(row, 'Supplier_Internal') || '').trim();
    if (!supplier) continue;
    var avail = String(AR_getM_(row, 'Availability') || '').trim();
    if (!avail) continue;

    // signal: availability contains "not" or "out" etc
    if (AR_isNotAvailable_(avail)) {
      flipSignals[supplier] = (flipSignals[supplier] || 0) + 1;
    }
  }

  // 2) complaint clustering from SERVICE_COMPLAINTS
  var clusterN = Number(policy.supplierComplaintClusterCount || 3);
  var winDays = Number(policy.supplierComplaintWindowDays || 30);
  var complaints = AR_countSupplierComplaints_(ss, now, winDays);

  // upsert suppliers rows deterministically
  var out = [AR_CFG.H.SUPPLIERS];
  var names = {};
  for (var s in sMap) if (sMap.hasOwnProperty(s)) names[s] = true;
  for (s in flipSignals) if (flipSignals.hasOwnProperty(s)) names[s] = true;
  for (s in complaints) if (complaints.hasOwnProperty(s)) names[s] = true;

  var nameList = [];
  for (s in names) if (names.hasOwnProperty(s)) nameList.push(s);
  nameList.sort();

  for (i = 0; i < nameList.length; i++) {
    var sup = nameList[i];
    var row0 = sMap[sup] || AR_blankRowOfLen_(AR_CFG.H.SUPPLIERS.length);

    // existing fields
    var phone = AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Phone');
    var area = AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Area');
    var spec = AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Category_Specialty');
    var rel = Number(AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Reliability_Score') || 100);
    var fails = Number(AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Last_Commit_Fail_Count') || 0);
    var allowed = String(AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Is_Allowed') || 'TRUE');

    // availability same-day flip signal: treat as "commit risk" increments (bounded)
    var sig = Number(flipSignals[sup] || 0);
    if (sig > 0) {
      fails += 1; // one increment per sync if any risk signal exists
      rel = Math.max(0, rel - 5);
    }

    // complaint clustering
    var cCount = Number(complaints[sup] || 0);
    if (cCount >= clusterN) {
      allowed = 'FALSE';
      rel = Math.max(0, rel - 15);
    }

    // deterministic minimum reliability floor
    if (!isFinite(rel)) rel = 0;
    if (rel > 100) rel = 100;

    var notes = String(AR_getByHdr_(row0, AR_CFG.H.SUPPLIERS, 'Notes') || '');
    var sysNote = 'Auto: sig=' + sig + ', complaints30d=' + cCount + ', fails=' + fails + ', rel=' + rel;
    notes = AR_mergeNotes_(notes, sysNote);

    var outRow = [
      sup,
      phone || '',
      area || '',
      spec || '',
      String(rel),
      String(fails),
      allowed,
      notes,
      AR_fmtDT_(now)
    ];
    out.push(outRow);
  }

  AR_writeExact_(supplierSh, out);
}

function AR_countSupplierComplaints_(ss, now, winDays) {
  var sh = ss.getSheetByName(AR_CFG.S.SERVICE_COMPLAINTS);
  if (!sh) return {};
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return {};

  var idx = AR_idx_(AR_norm_(data[0]));
  var cutoff = new Date(now.getTime() - winDays * 86400000);
  var out = {};
  for (var i = 1; i < data.length; i++) {
    var dt = AR_parseDate_(data[i][idx['logged_at']]);
    if (!dt || dt < cutoff) continue;
    var sup = String(data[i][idx['supplier_name']] || '').trim();
    if (!sup) continue;
    var resolved = String(data[i][idx['resolved']] || '').toUpperCase();
    // count both resolved and unresolved for risk
    out[sup] = (out[sup] || 0) + 1;
  }
  return out;
}

function AR_isNotAvailable_(s) {
  var t = String(s || '').toLowerCase();
  if (!t) return false;
  if (t.indexOf('out') >= 0) return true;
  if (t.indexOf('not') >= 0) return true;
  if (t.indexOf('na') === 0) return true;
  if (t.indexOf('unavail') >= 0) return true;
  return false;
}

function AR_mergeNotes_(notes, sysLine) {
  var n = String(notes || '');
  var s = String(sysLine || '');
  if (!s) return n;
  // keep it bounded
  if (n.indexOf('Auto:') >= 0) {
    // replace last Auto line
    var parts = n.split('\n');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      if (String(parts[i]).indexOf('Auto:') === 0) continue;
      out.push(parts[i]);
    }
    out.push(s);
    return out.join('\n').substring(0, 1000);
  }
  return (n ? (n + '\n' + s) : s).substring(0, 1000);
}

/* ===========================
   PRICE ARCHIVE (APPEND CHANGES ONLY)
=========================== */

function AR_archivePriceChanges_(ss, masterMap, policy, now) {
  var sh = ss.getSheetByName(AR_CFG.S.PRICE_ARCHIVE);
  var data = sh.getDataRange().getValues();
  var last = {};
  if (data.length >= 2) {
    var hdr = AR_idx_(AR_norm_(data[0]));
    for (var i = data.length - 1; i >= 1; i--) {
      var k = String(data[i][hdr['product_key']] || '').trim();
      if (!k || last[k]) continue;
      last[k] = {
        minP: Number(data[i][hdr['minimum_price']] || 0),
        retail: Number(data[i][hdr['retail_price']] || 0),
        floor: Number(data[i][hdr['cash_floor']] || 0)
      };
    }
  }

  var out = [];
  for (var k2 in masterMap) if (masterMap.hasOwnProperty(k2)) {
    var row = masterMap[k2].row;
    var minP = Number(AR_getM_(row, 'Minimum_Price') || 0);
    var sys = Number(AR_getM_(row, 'System_Cost') || 0);
    var retail = Number(AR_getM_(row, 'Retail_Price') || 0);
    var floor = Number(AR_getM_(row, 'Cash_Floor') || 0);

    var prev = last[k2];
    var changed = (!prev || prev.minP !== minP || prev.retail !== retail || prev.floor !== floor);
    if (changed) {
      out.push([AR_fmtDT_(now), k2, minP, sys, retail, floor, prev ? 'PRICE_CHANGE' : 'FIRST_SNAPSHOT']);
    }
  }

  if (out.length) {
    sh.getRange(sh.getLastRow() + 1, 1, out.length, AR_CFG.H.PRICE_ARCHIVE.length).setValues(out);
  }
}

/* ===========================
   QC QUEUE (DERIVED, REBUILT)
=========================== */

function AR_rebuildQCQueue_(ss, masterMap, now) {
  var sh = ss.getSheetByName(AR_CFG.S.QC);
  AR_clearBelowHeader_(sh);

  var out = [AR_CFG.H.QC];
  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) {
    var row = masterMap[k].row;
    var qcReq = String(AR_getM_(row, 'QC_Required') || 'FALSE');
    if (qcReq !== 'TRUE') continue;

    var qcPassed = String(AR_getM_(row, 'QC_Passed') || 'FALSE');
    var retail = Number(AR_getM_(row, 'Retail_Price') || 0);

    out.push([
      AR_fmtDT_(now),
      k,
      AR_getM_(row, 'Brand'),
      AR_getM_(row, 'Category'),
      AR_getM_(row, 'Model'),
      retail,
      qcReq,
      qcPassed,
      '',
      '',
      '',
      (qcPassed === 'TRUE') ? 'FALSE' : 'TRUE'
    ]);
  }

  AR_writeExact_(sh, out);
}

/* ===========================
   LIVE PUBLISH (DERIVED, SAFE GATING)
=========================== */

function AR_rebuildLive_(ss, masterMap, policy, now) {
  var sh = ss.getSheetByName(AR_CFG.S.LIVE);
  var roundTo = Number(policy.roundTo || 500);
  var missMult = Number(policy.missingMonth1Multiplier || 1.15);

  var out = [AR_CFG.H.LIVE];

  for (var k in masterMap) if (masterMap.hasOwnProperty(k)) {
    var m = masterMap[k].row;

    var lifecycle = String(AR_getM_(m, 'Lifecycle_Status') || 'ACTIVE');
    var missingCount = Number(AR_getM_(m, 'Missing_Count') || 0);
    var qcReq = String(AR_getM_(m, 'QC_Required') || 'FALSE');
    var qcPassed = String(AR_getM_(m, 'QC_Passed') || 'FALSE');

    var retail = Number(AR_getM_(m, 'Retail_Price') || 0);
    var floor = Number(AR_getM_(m, 'Cash_Floor') || 0);

    var desc = String(AR_getM_(m, 'Description') || '');
    var specs = String(AR_getM_(m, 'Specifications') || '');
    var img1 = String(AR_getM_(m, 'Image_URL_1') || '');
    var img2 = String(AR_getM_(m, 'Image_URL_2') || '');

    var publish = 'PUBLISHED';
    var reason = '';

    if (lifecycle === 'HIDDEN_MISSING') { publish = 'HOLD'; reason = 'MISSING_MONTH_2_HIDE'; }

    if (publish === 'PUBLISHED' && lifecycle === 'PRICE_PAUSE') {
      publish = 'HOLD'; reason = 'VOLATILITY_CONFIRMATION_REQUIRED';
    }

    if (publish === 'PUBLISHED' && (!desc || !specs || !img1 || !img2)) {
      publish = 'HOLD'; reason = 'MISSING_REQUIRED_CONTENT';
    }

    if (publish === 'PUBLISHED' && qcReq === 'TRUE' && qcPassed !== 'TRUE') {
      publish = 'HOLD'; reason = 'QC_REQUIRED_NOT_PASSED';
    }

    // Month 1 missing premium (+15% single multiplier) when Missing_Count == 1
    if (publish === 'PUBLISHED' && missingCount === 1) {
      retail = AR_round_(retail * missMult, roundTo);
      floor = AR_round_(floor * missMult, roundTo);

      var tags = String(AR_getM_(m, 'Tags') || '');
      tags = tags ? (tags + ',SHORTAGE_PREMIUM') : 'SHORTAGE_PREMIUM';
      AR_setM_(m, 'Tags', tags);
      AR_setM_(m, 'Inquiry_Needed', 'TRUE');
      AR_setM_(m, 'Shortage_Premium', 'TRUE');
    }

    out.push([
      k,
      AR_getM_(m, 'Brand'),
      AR_getM_(m, 'Category'),
      AR_getM_(m, 'Model'),
      retail,
      floor,
      AR_getM_(m, 'Warranty'),
      AR_getM_(m, 'Tags'),
      desc,
      specs,
      img1,
      img2,
      qcReq,
      qcPassed,
      publish,
      reason,
      AR_fmtDT_(now)
    ]);
  }

  AR_writeExact_(sh, out);
}

/* ===========================
   WEBSITE FEED (DERIVED FROM LIVE)
=========================== */

function AR_rebuildWebsiteFeed_(ss, now) {
  var liveSh = ss.getSheetByName(AR_CFG.S.LIVE);
  var outSh = ss.getSheetByName(AR_CFG.S.WEBSITE_FEED);

  var data = liveSh.getDataRange().getValues();
  if (data.length < 2) {
    AR_writeExact_(outSh, [AR_CFG.H.WEBSITE_FEED]);
    return;
  }

  var idx = AR_idx_(AR_norm_(data[0]));
  var out = [AR_CFG.H.WEBSITE_FEED];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var status = String(row[idx['publish_status']] || '');
    if (status !== 'PUBLISHED') continue;

    out.push([
      row[idx['product_key']],
      row[idx['brand']],
      row[idx['category']],
      row[idx['model']],
      row[idx['retail_price']],
      row[idx['cash_floor']],
      row[idx['warranty']],
      row[idx['tags']],
      row[idx['description']],
      row[idx['specifications']],
      row[idx['image_url_1']],
      row[idx['image_url_2']],
      AR_fmtDT_(now)
    ]);
  }

  AR_writeExact_(outSh, out);
}

/* ===========================
   SEO FACTORY (DETERMINISTIC TEMPLATES)
=========================== */

function AR_rebuildSEOPages_(ss, now) {
  var policy = AR_loadPolicy_(ss);
  var city = String(policy.seoCity || 'Karachi');
  var brandName = String(policy.seoBrand || 'Tajalli’s Home Collection');

  var feedSh = ss.getSheetByName(AR_CFG.S.WEBSITE_FEED);
  var seoSh = ss.getSheetByName(AR_CFG.S.SEO_PAGES);

  var data = feedSh.getDataRange().getValues();
  if (data.length < 2) {
    AR_writeExact_(seoSh, [AR_CFG.H.SEO]);
    return;
  }

  var idx = AR_idx_(AR_norm_(data[0]));
  var out = [AR_CFG.H.SEO];

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var key = String(row[idx['product_key']] || '');
    if (!key) continue;

    var b = String(row[idx['brand']] || '');
    var c = String(row[idx['category']] || '');
    var m = String(row[idx['model']] || '');
    var price = row[idx['retail_price']];

    var slug = AR_slug_(b + '-' + c + '-' + m + '-' + city);

    var title = b + ' ' + m + ' ' + c + ' Price in ' + city + ' | ' + brandName;
    var meta = 'Buy ' + b + ' ' + m + ' (' + c + ') in ' + city +
      '. Updated price and delivery guidance. Order via WhatsApp with after-sales support.';

    var h1 = b + ' ' + m + ' (' + c + ') in ' + city;
    var body =
      'Updated price: ' + price + ' PKR.\n' +
      'What you get: official warranty (where available), delivery coordination, and after-sales support.\n' +
      'Best for: Karachi usage conditions (voltage fluctuation, humidity/rusting areas).\n' +
      'To order: message us on WhatsApp with your area and floor number.\n';

    out.push([slug, 'PRODUCT', key, title, meta, h1, body, AR_fmtDT_(now)]);
  }

  AR_writeExact_(seoSh, out);
}

function AR_slug_(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);
}

/* ===========================
   LOYALTY / CRM SCAFFOLDS
=========================== */

function AR_seedLoyaltyTiersIfEmpty_(ss, now) {
  var sh = ss.getSheetByName(AR_CFG.S.LOYALTY_TIERS);
  var lastRow = sh.getLastRow();
  if (lastRow > 1) return;

  var out = [
    AR_CFG.H.LOYALTY,
    ['Bronze', 0, 'Basic support, priority scheduling (when possible)', AR_fmtDT_(now)],
    ['Silver', 150000, 'Faster scheduling, seasonal check-in offers', AR_fmtDT_(now)],
    ['Gold', 400000, 'Priority support, small service perks, loyalty promos', AR_fmtDT_(now)]
  ];
  AR_writeExact_(sh, out);
}

/* ===========================
   CREDIT ENGINE + GOVERNANCE (FLAGS ONLY)
=========================== */

function AR_calcCreditPlan_(policy, retailPrice, tenureMonths) {
  var r = Number(retailPrice || 0);
  var roundTo = Number(policy.roundTo || 500);
  var advPct = 0.30;

  var mult = 0;
  if (tenureMonths === 12) mult = Number(policy.creditMultiplier_12 || 1.35);
  else if (tenureMonths === 6) mult = Number(policy.creditMultiplier_6 || 1.20);
  else if (tenureMonths === 3) mult = Number(policy.creditMultiplier_3 || 1.13);
  else if (tenureMonths === 2) mult = Number(policy.creditMultiplier_2 || 1.08);
  else throw new Error('Invalid tenure: ' + tenureMonths);

  var total = AR_round_(r * mult, roundTo);
  var adv = AR_round_(total * advPct, roundTo);
  var denom = tenureMonths - 1;
  var monthly = AR_round_((total - adv) / denom, roundTo);

  return { Total: total, Advance: adv, Monthly: monthly };
}

function AR_enforceCreditGovernance_(ss, policy, now) {
  var ordersSh = ss.getSheetByName(AR_CFG.S.ORDERS);
  var creditSh = ss.getSheetByName(AR_CFG.S.CREDIT);
  var fwSh = ss.getSheetByName(AR_CFG.S.SERVICE_FRAMEWORK);

  var capPct = Number(policy.creditSalesCapPct || 0.20);
  var freezePct = Number(policy.creditOverdueFreezePct || 0.05);
  var windowDays = Number(policy.creditWindowDays || 30);

  var o = ordersSh.getDataRange().getValues();
  if (o.length < 2) {
    AR_upsertFramework_(fwSh, 'CREDIT', 'NewCreditFrozen', 'FALSE', now);
    AR_upsertFramework_(fwSh, 'CREDIT', 'CreditCapBreached', 'FALSE', now);
    return;
  }
  var oIdx = AR_idx_(AR_norm_(o[0]));
  var cutoff = new Date(now.getTime() - windowDays * 86400000);

  var totalSales = 0, creditSales = 0;
  for (var i = 1; i < o.length; i++) {
    var created = o[i][oIdx['created_at']];
    var dt = AR_parseDate_(created);
    if (!dt || dt < cutoff) continue;
    var total = Number(o[i][oIdx['total']] || 0);
    totalSales += total;
    var mode = String(o[i][oIdx['payment_mode']] || '').toUpperCase();
    if (mode === 'CREDIT') creditSales += total;
  }

  var c = creditSh.getDataRange().getValues();
  var exposure = 0, overdue = 0;
  if (c.length >= 2) {
    var cIdx = AR_idx_(AR_norm_(c[0]));
    for (i = 1; i < c.length; i++) {
      var status = String(c[i][cIdx['status']] || '').toUpperCase();
      if (status === 'REJECTED' || status === 'CLOSED') continue;
      exposure += Number(c[i][cIdx['outstanding']] || 0);
      overdue += Number(c[i][cIdx['overdue_amount']] || 0);
    }
  }

  var creditShare = totalSales > 0 ? (creditSales / totalSales) : 0;
  var overdueShare = exposure > 0 ? (overdue / exposure) : 0;

  var freeze = (overdueShare > freezePct);
  var capBreached = (creditShare > capPct);

  AR_upsertFramework_(fwSh, 'CREDIT', 'RollingWindowDays', String(windowDays), now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'CreditSalesShare', String(creditShare), now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'CreditSalesCapPct', String(capPct), now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'OverdueShare', String(overdueShare), now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'OverdueFreezePct', String(freezePct), now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'NewCreditFrozen', freeze ? 'TRUE' : 'FALSE', now);
  AR_upsertFramework_(fwSh, 'CREDIT', 'CreditCapBreached', capBreached ? 'TRUE' : 'FALSE', now);

  // optional: annotate CREDIT_GOVERNANCE rows in Notes? not available in schema, so only framework is updated.
}

function AR_upsertFramework_(sh, section, rule, value, now) {
  var data = sh.getDataRange().getValues();
  if (data.length < 2) {
    AR_writeExact_(sh, [AR_CFG.H.SERVICE_FRAMEWORK, [section, rule, value, '', AR_fmtDT_(now)]]);
    return;
  }
  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0] || '') === section && String(data[r][1] || '') === rule) {
      data[r][2] = value;
      data[r][4] = AR_fmtDT_(now);
      AR_writeExact_(sh, data);
      return;
    }
  }
  data.push([section, rule, value, '', AR_fmtDT_(now)]);
  AR_writeExact_(sh, data);
}

/* ===========================
   INSTALLER PAUSE (COMPLAINT RATE > 15%)
=========================== */

function AR_applyInstallerPause_(ss, policy, now) {
  var thr = Number(policy.installerPauseComplaintRate || 0.15);
  var sh = ss.getSheetByName(AR_CFG.S.INSTALLER_SCORECARD);
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return;

  var idx = AR_idx_(AR_norm_(data[0]));
  for (var i = 1; i < data.length; i++) {
    var rate = Number(data[i][idx['complaint_rate']] || 0);
    if (!isFinite(rate)) rate = 0;
    if (rate > thr) data[i][idx['is_allowed']] = 'FALSE';
    data[i][idx['updated_at']] = AR_fmtDT_(now);
  }
  AR_writeExact_(sh, data);
}

/* ===========================
   ORDERS RECALC (DISCOUNTS + QC LOCK SUPPORT)
=========================== */

function AR_recalculateOrders_(ss, policy, now) {
  var ordersSh = ss.getSheetByName(AR_CFG.S.ORDERS);
  var liveSh = ss.getSheetByName(AR_CFG.S.LIVE);
  var custSh = ss.getSheetByName(AR_CFG.S.CUSTOMERS);

  var o = ordersSh.getDataRange().getValues();
  if (o.length < 2) return;

  var live = liveSh.getDataRange().getValues();
  var liveIdx = live.length ? AR_idx_(AR_norm_(live[0])) : {};
  var liveMap = {};
  for (var i = 1; i < live.length; i++) {
    var key = String(live[i][liveIdx['product_key']] || '').trim();
    if (!key) continue;
    liveMap[key] = {
      retail: Number(live[i][liveIdx['retail_price']] || 0),
      floor: Number(live[i][liveIdx['cash_floor']] || 0),
      publish: String(live[i][liveIdx['publish_status']] || ''),
      qcReq: String(live[i][liveIdx['qc_required']] || 'FALSE'),
      qcPassed: String(live[i][liveIdx['qc_passed']] || 'FALSE')
    };
  }

  var customers = custSh.getDataRange().getValues();
  var cIdx = customers.length ? AR_idx_(AR_norm_(customers[0])) : {};
  var custMap = {};
  for (i = 1; i < customers.length; i++) {
    var cid = String(customers[i][cIdx['customer_id']] || '').trim();
    if (!cid) continue;
    custMap[cid] = {
      address: String(customers[i][cIdx['address']] || ''),
      floor: Number(customers[i][cIdx['floor_number']] || 0),
      area: String(customers[i][cIdx['area']] || '')
    };
  }

  var oIdx = AR_idx_(AR_norm_(o[0]));
  var multiPct = Number(policy.multiProductDiscountPct || 0.02);
  var bankPct = Number(policy.bankTransferDiscountPct || 0.01);
  var roundTo = Number(policy.roundTo || 500);

  var firstKm = Number(policy.deliveryFirstKm || 650);
  var perKm = Number(policy.deliveryPerKm || 200);
  var laborPerFloorPerProduct = Number(policy.laborPerFloorPerProduct || 400);
  var origin = String(policy.storeOriginAddress || '');

  for (i = 1; i < o.length; i++) {
    var itemsJson = String(o[i][oIdx['items_json']] || '').trim();
    var customerId = String(o[i][oIdx['customer_id']] || '').trim();
    var paymentMode = String(o[i][oIdx['payment_mode']] || '').toUpperCase();

    var items = AR_parseItemsJsonSafe_(itemsJson);
    var subtotal = 0;
    var qcBlocked = 'FALSE';
    var itemCount = 0;

    for (var j = 0; j < items.length; j++) {
      var pk = String(items[j].Product_Key || items[j].product_key || items[j].key || '').trim();
      if (!pk || !liveMap[pk]) continue;
      var qty = Number(items[j].Qty || items[j].qty || 1);
      if (!isFinite(qty) || qty <= 0) qty = 1;

      // only count published products; if not published, QC lock the order
      if (liveMap[pk].publish !== 'PUBLISHED') qcBlocked = 'TRUE';

      subtotal += (liveMap[pk].retail * qty);
      itemCount += qty;

      if (liveMap[pk].qcReq === 'TRUE' && liveMap[pk].qcPassed !== 'TRUE') qcBlocked = 'TRUE';
    }

    subtotal = AR_round_(subtotal, roundTo);

    var multiDisc = (itemCount >= 2) ? AR_round_(subtotal * multiPct, roundTo) : 0;
    var bankDisc = (paymentMode === 'BANK_TRANSFER') ? AR_round_(subtotal * bankPct, roundTo) : 0;

    // delivery + labor from customer address/floor via built-in Maps service
    var deliveryCharge = 0;
    var laborCharge = 0;
    if (customerId && custMap[customerId]) {
      var dest = custMap[customerId].address;
      var floorN = Number(custMap[customerId].floor || 0);
      if (!isFinite(floorN) || floorN < 0) floorN = 0;

      var km = AR_calcDistanceKmNoKey_(origin, dest);
      if (km !== null) {
        deliveryCharge = AR_calcDeliveryCharge_(km, firstKm, perKm, roundTo);
      }
      laborCharge = AR_round_(laborPerFloorPerProduct * floorN * Math.max(1, itemCount), roundTo);
    }

    var total = subtotal - multiDisc - bankDisc + deliveryCharge + laborCharge;
    total = AR_round_(total, roundTo);

    o[i][oIdx['subtotal']] = subtotal;
    o[i][oIdx['multi_product_discount']] = multiDisc;
    o[i][oIdx['bank_transfer_discount']] = bankDisc;
    o[i][oIdx['delivery_charge']] = deliveryCharge;
    o[i][oIdx['floor_labor_charge']] = laborCharge;
    o[i][oIdx['total']] = total;
    o[i][oIdx['qc_blocked']] = qcBlocked;

    // dispatch lock support:
    // if Status is moving to DELIVERED and QC_Blocked is TRUE, admin should not do it.
    // we cannot block edits without protection; we surface via Notes
    var status = String(o[i][oIdx['status']] || '').toUpperCase();
    if (status === 'DELIVERED' && qcBlocked === 'TRUE') {
      var notes = String(o[i][oIdx['notes']] || '');
      var line = 'QC_LOCK: Order marked DELIVERED while QC_Blocked=TRUE. Review required.';
      o[i][oIdx['notes']] = AR_mergeNotes_(notes, line);
    }
  }

  AR_writeExact_(ordersSh, o);
}

function AR_parseItemsJsonSafe_(s) {
  if (!s) return [];
  try {
    var obj = JSON.parse(s);
    if (Object.prototype.toString.call(obj) === '[object Array]') return obj;
    if (obj && obj.items && Object.prototype.toString.call(obj.items) === '[object Array]') return obj.items;
    return [];
  } catch (e) {
    return [];
  }
}

function AR_calcDeliveryCharge_(km, firstKm, perKm, roundTo) {
  var k = Number(km || 0);
  if (!isFinite(k) || k <= 0) return 0;
  if (k <= 1) return AR_round_(firstKm, roundTo);
  return AR_round_(firstKm + (k - 1) * perKm, roundTo);
}

/* ===========================
   DISTANCE CALC (NO API KEY, BUILT-IN MAPS)
=========================== */

function AR_calcDistanceKmNoKey_(origin, destination) {
  origin = String(origin || '').trim();
  destination = String(destination || '').trim();
  if (!origin || !destination) return null;

  try {
    var res = Maps.newDirectionFinder()
      .setOrigin(origin)
      .setDestination(destination)
      .setMode(Maps.DirectionFinder.Mode.DRIVING)
      .getDirections();

    if (!res || !res.routes || !res.routes.length) return null;
    var leg = res.routes[0].legs && res.routes[0].legs.length ? res.routes[0].legs[0] : null;
    if (!leg || !leg.distance || leg.distance.value === undefined) return null;

    var meters = Number(leg.distance.value || 0);
    if (!isFinite(meters) || meters <= 0) return null;
    // km to 1 decimal, deterministic
    return Math.round((meters / 1000) * 10) / 10;
  } catch (e) {
    return null;
  }
}

/* ===========================
   BOT + COMM LOG HELPERS (SCAFFOLD)
=========================== */

function AR_logBotTranscript(channel, customerPhone, messageIn, messageOut, escalatedToHuman, contextObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(AR_CFG.S.BOT);
  var ctx = contextObj ? JSON.stringify(contextObj) : '';
  sh.appendRow([AR_fmtDT_(new Date()), channel || '', customerPhone || '', messageIn || '', messageOut || '', escalatedToHuman ? 'TRUE' : 'FALSE', ctx]);
}

function AR_logCommunication(customerId, channel, direction, message, relatedOrderId, tags) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(AR_CFG.S.COMM);
  sh.appendRow([AR_fmtDT_(new Date()), customerId || '', channel || '', direction || '', message || '', relatedOrderId || '', tags || '']);
}

/* ===========================
   BOT SUGGESTION HELPER (2 PRODUCTS)
   Category pre-chosen by customer.
   Requirement must be met first; only then prefer margin.
=========================== */

function AR_suggestTwoProducts(category, requirementsObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(AR_CFG.S.WEBSITE_FEED); // use published feed
  var data = sh.getDataRange().getValues();
  if (data.length < 2) return [];

  var idx = AR_idx_(AR_norm_(data[0]));
  var reqTags = (requirementsObj && requirementsObj.requiredTags) ? requirementsObj.requiredTags : [];
  var reqKeywords = (requirementsObj && requirementsObj.requiredKeywords) ? requirementsObj.requiredKeywords : [];

  var candidates = [];
  for (var r = 1; r < data.length; r++) {
    var cat = String(data[r][idx['category']] || '');
    if (String(category || '') && cat !== String(category)) continue;

    var tags = String(data[r][idx['tags']] || '');
    var desc = String(data[r][idx['description']] || '');
    var specs = String(data[r][idx['specifications']] || '');
    var hay = (tags + ' ' + desc + ' ' + specs).toLowerCase();

    if (!AR_meetsReq_(hay, reqTags, reqKeywords)) continue;

    var retail = Number(data[r][idx['retail_price']] || 0);
    var floor = Number(data[r][idx['cash_floor']] || 0);
    var margin = retail - floor;

    candidates.push({
      Product_Key: data[r][idx['product_key']],
      Brand: data[r][idx['brand']],
      Category: cat,
      Model: data[r][idx['model']],
      Retail_Price: retail,
      Cash_Floor: floor,
      Margin: margin
    });
  }

  candidates.sort(function (a, b) { return (b.Margin || 0) - (a.Margin || 0); });
  return candidates.slice(0, 2);
}

function AR_meetsReq_(hayLower, reqTags, reqKeywords) {
  var h = String(hayLower || '').toLowerCase();
  for (var i = 0; i < reqTags.length; i++) {
    var t = String(reqTags[i] || '').toLowerCase();
    if (t && h.indexOf(t) < 0) return false;
  }
  for (i = 0; i < reqKeywords.length; i++) {
    var k = String(reqKeywords[i] || '').toLowerCase();
    if (k && h.indexOf(k) < 0) return false;
  }
  return true;
}

/* ===========================
   FAST WRITE / CLEAR (ZERO-ROW SAFE)
=========================== */

function AR_clearBelowHeader_(sh) {
  var lastRow = sh.getLastRow();
  var lastCol = sh.getMaxColumns();
  if (lastRow > 1) sh.getRange(2, 1, lastRow - 1, lastCol).clearContent();
}

function AR_writeExact_(sh, values2d) {
  var rows = values2d.length;
  var cols = values2d[0].length;

  if (sh.getMaxColumns() < cols) sh.insertColumnsAfter(sh.getMaxColumns(), cols - sh.getMaxColumns());

  AR_clearBelowHeader_(sh);

  sh.getRange(1, 1, rows, cols).setValues(values2d);

  var lastRow = sh.getLastRow();
  if (lastRow > rows) {
    sh.getRange(rows + 1, 1, lastRow - rows, sh.getMaxColumns()).clearContent();
  }
}

/* ===========================
   LOW-LEVEL UTILS
=========================== */

function AR_norm_(row) {
  var out = [];
  for (var i = 0; i < row.length; i++) out.push(String(row[i] || '').trim().toLowerCase());
  return out;
}

function AR_idx_(hdrLower) {
  var m = {};
  for (var i = 0; i < hdrLower.length; i++) {
    var h = hdrLower[i];
    if (h) m[h] = i;
  }
  return m;
}

function AR_blankRow_(row) {
  for (var i = 0; i < row.length; i++) if (String(row[i] || '').trim() !== '') return false;
  return true;
}

function AR_s_(row, idx, keyLower) {
  var i = idx[keyLower];
  if (i === undefined) return '';
  return String(row[i] || '').trim();
}

function AR_n_(row, idx, keyLower) {
  var i = idx[keyLower];
  if (i === undefined) return 0;
  var v = Number(row[i] || 0);
  return isFinite(v) ? v : 0;
}

function AR_key_(brand, cat, model) {
  return String(brand).trim() + '|' + String(cat).trim() + '|' + String(model).trim();
}

function AR_round_(x, roundTo) {
  var n = Number(x || 0);
  var r = Number(roundTo || 500);
  return Math.round(n / r) * r;
}

function AR_blankRowOfLen_(len) {
  var a = [];
  for (var i = 0; i < len; i++) a.push('');
  return a;
}

// MASTER getters/setters (fast index map)
var AR_MASTER_IDX = null;
function AR_masterIdx_() {
  if (AR_MASTER_IDX) return AR_MASTER_IDX;
  AR_MASTER_IDX = {};
  for (var i = 0; i < AR_CFG.H.MASTER.length; i++) AR_MASTER_IDX[AR_CFG.H.MASTER[i]] = i;
  return AR_MASTER_IDX;
}
function AR_getM_(row, headerName) {
  var idx = AR_masterIdx_()[headerName];
  if (idx === undefined) return '';
  return row[idx];
}
function AR_setM_(row, headerName, value) {
  var idx = AR_masterIdx_()[headerName];
  if (idx === undefined) return;
  row[idx] = value;
}

// generic header-based getter for arbitrary row arrays
function AR_getByHdr_(row, headers, name) {
  for (var i = 0; i < headers.length; i++) if (headers[i] === name) return row[i];
  return '';
}

function AR_mergePreferNonEmpty_(a, b) {
  var out = {};
  for (var k in a) if (a.hasOwnProperty(k)) out[k] = a[k];
  for (k in b) if (b.hasOwnProperty(k)) {
    var v = b[k];
    if (v !== null && v !== undefined && String(v).trim() !== '') out[k] = v;
  }
  return out;
}

function AR_fmtDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function AR_fmtDT_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function AR_parseDate_(v) {
  if (v === null || v === undefined || v === '') return null;

  // already date
  if (Object.prototype.toString.call(v) === '[object Date]') return v;

  // numeric serial date from Sheets (fixes 1899 issues)
  if (typeof v === 'number' && isFinite(v)) {
    // Google Sheets serial: days since 1899-12-30
    // if v is very small, it might be a numeric id; guard
    if (v > 1000) {
      var ms = Math.round((v - 25569) * 86400000); // 1970-01-01 is 25569
      var d = new Date(ms);
      if (isFinite(d.getTime())) return d;
    }
    return null;
  }

  var s = String(v).trim();
  if (!s) return null;

  var d2 = new Date(s);
  if (!isFinite(d2.getTime())) return null;
  return d2;
}

function AR_monthDiff_(yyyyMmDdA, yyyyMmDdB) {
  var a = String(yyyyMmDdA || '').split('-');
  var b = String(yyyyMmDdB || '').split('-');
  if (a.length < 2 || b.length < 2) return 0;
  var ay = Number(a[0] || 0), am = Number(a[1] || 1);
  var by = Number(b[0] || 0), bm = Number(b[1] || 1);
  if (!ay || !by) return 0;
  return (by * 12 + bm) - (ay * 12 + am);
}
/***************************************************************
 APPLIANCE RELIANCE – UNIFIED LAUNCH STACK (SHEETS CONTROL PLANE)
 ES5-compatible • deterministic • batch optimized
 Includes: Engine + Web API + WhatsApp webhook logger
***************************************************************/

/* ===========================
  CONFIG
=========================== */

var RE = {
  REQUIRED_SHEETS: [
    'Raw 1','Raw 2','Raw 3',
    'MASTER_PRODUCTS','SUPPLIERS','PRODUCTS_LIVE',
    'Price_Archive','QC_QUEUE','INSTALLER_SCORECARD',
    'CUSTOMERS','CREDIT_GOVERNANCE','ORDERS','BOT_TRANSCRIPTS',
    'PROMOS_AND_PACKAGES','POLICY_PARAMETERS'
  ],
  // QC categories (you defined these explicitly)
  QC_CATS: {'TVs':true,'ACs':true,'Fridges':true,'Freezers':true},
  QC_THRESHOLD: 100000,

  // Missing lifecycle
  MISSING_DAYS_1: 30,
  MISSING_DAYS_2: 60,
  MISSING_PREMIUM_MULT: 1.25,

  // Pricing base rule
  RETAIL_MULT: 1.05,

  // Solar volatility
  SOLAR_VOL_PCT: 0.15,

  // Credit governance (lifetime revenue)
  CREDIT_CAP_PCT: 0.20,
  OVERDUE_FREEZE_PCT: 0.05,

  // Installer pause
  INSTALLER_COMPLAINTS_LIMIT: 2,
  INSTALLER_WINDOW_DAYS: 30,

  // Multi-product discount
  MULTI_DISCOUNT_PCT: 0.02,

  // Rounding
  ROUND_STEP: 500
};

/* ===========================
  UI
=========================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Reliance Engine')
    .addItem('Initialize / Repair', 'RE_initialize')
    .addItem('Full Sync Now', 'RE_fullSync')
    .addItem('Install 6-hour Trigger', 'RE_installTrigger')
    .addItem('Remove Triggers', 'RE_removeTriggers')
    .addSeparator()
    .addItem('Live Readiness Check', 'RE_liveCheck')
    .addToUi();
}

/* ===========================
  INIT / STRUCTURE
=========================== */

function RE_initialize() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  for (var i=0;i<RE.REQUIRED_SHEETS.length;i++) {
    var name = RE.REQUIRED_SHEETS[i];
    var sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
  }
  // Ensure minimal headers exist (idempotent). Keep these stable once set.
  RE_ensureHeaders_();
  SpreadsheetApp.getUi().alert('Initialize complete.');
}

function RE_ensureHeaders_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // MASTER_PRODUCTS (core)
  RE_setHeader_(ss,'MASTER_PRODUCTS',[
    'Product_ID','Brand','Category','Model',
    'Minimum_Price','System_Cost','Retail_Price',
    'Availability','Availability_last_confirmed_at','Missing_Count',
    'Supplier','Supplier_Cost_Last','Supplier_Cost_Confirmed_At','Solar_Volatility_Flag',
    'QC_Required','QC_Passed','QC_Serial','QC_PhotoPack_URL',
    'Installer','Installer_Status',
    'Loyalty_Eligible',
    'Status','Publish_Eligible','Publish_Reason',
    'Image_URL_1','Image_URL_2','Description','Specifications','Tags',
    'Updated_At'
  ]);

  // PRODUCTS_LIVE (website feed)
  RE_setHeader_(ss,'PRODUCTS_LIVE',[
    'Product_ID','Brand','Category','Model',
    'Retail_Price','Minimum_Price','System_Cost',
    'Availability','Installment_Options_JSON',
    'QC_Required','Status',
    'Image_URL_1','Image_URL_2','Description','Specifications','Tags',
    'Updated_At'
  ]);

  // SUPPLIERS
  RE_setHeader_(ss,'SUPPLIERS',[
    'Supplier','Brand','Category','Active','Last_Sync_At','Notes'
  ]);

  // Price_Archive
  RE_setHeader_(ss,'Price_Archive',[
    'Archived_At','Product_ID','Brand','Category','Model',
    'Minimum_Price','System_Cost','Retail_Price','Reason'
  ]);

  // QC_QUEUE
  RE_setHeader_(ss,'QC_QUEUE',[
    'Created_At','Product_ID','Category','Model','Retail_Price',
    'QC_Required','QC_Passed','QC_Serial','QC_PhotoPack_URL','Notes'
  ]);

  // INSTALLER_SCORECARD
  RE_setHeader_(ss,'INSTALLER_SCORECARD',[
    'Installer','Active','Paused','Complaints_30d','Last_Complaint_At','Pause_Reason','Updated_At'
  ]);

  // CUSTOMERS
  RE_setHeader_(ss,'CUSTOMERS',[
    'Customer_ID','Name','Phone','Email',
    'Lifetime_Spend','Loyalty_Tier','Created_At','Updated_At'
  ]);

  // CREDIT_GOVERNANCE
  RE_setHeader_(ss,'CREDIT_GOVERNANCE',[
    'AsOf','Lifetime_Revenue','Outstanding_Principal','Outstanding_Overdue',
    'Credit_Cap_PKR','Cap_Breached','Overdue_Freeze','Notes'
  ]);

  // ORDERS
  RE_setHeader_(ss,'ORDERS',[
    'Order_ID','Created_At','Customer_ID','Customer_Phone',
    'Mode','Items_JSON','Subtotal','Discount','Total',
    'Advance','Installment_Months','Monthly','Outstanding_Principal',
    'Status','Notes'
  ]);

  // BOT_TRANSCRIPTS
  RE_setHeader_(ss,'BOT_TRANSCRIPTS',[
    'Received_At','From','Type','Message','Raw_JSON','Human_Takeover'
  ]);

  // POLICY_PARAMETERS (you can extend; keep deterministic)
  RE_setHeader_(ss,'POLICY_PARAMETERS',[
    'Key','Value'
  ]);
}

function RE_setHeader_(ss, sheetName, headerArr) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return;
  var existing = sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getValues()[0];
  var normalizedExisting = [];
  for (var i=0;i<existing.length;i++) normalizedExisting.push(String(existing[i]||'').trim());
  var needs = false;
  for (var j=0;j<headerArr.length;j++) {
    if (normalizedExisting[j] !== headerArr[j]) { needs = true; break; }
  }
  if (needs || sh.getLastRow() === 0) {
    sh.getRange(1,1,1,headerArr.length).setValues([headerArr]);
  }
}

/* ===========================
  TRIGGERS
=========================== */

function RE_installTrigger() {
  RE_removeTriggers();
  ScriptApp.newTrigger('RE_fullSync').timeBased().everyHours(6).create();
  SpreadsheetApp.getUi().alert('6-hour trigger installed.');
}

function RE_removeTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i=0;i<triggers.length;i++) ScriptApp.deleteTrigger(triggers[i]);
}

/* ===========================
  LIVE CHECK
=========================== */

function RE_liveCheck() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var missing = [];
  for (var i=0;i<RE.REQUIRED_SHEETS.length;i++) {
    if (!ss.getSheetByName(RE.REQUIRED_SHEETS[i])) missing.push(RE.REQUIRED_SHEETS[i]);
  }
  if (missing.length) {
    SpreadsheetApp.getUi().alert('Missing sheets: ' + missing.join(', '));
    return;
  }
  SpreadsheetApp.getUi().alert('Live check: structure OK.');
}

/* ===========================
  CORE SYNC
=========================== */

function RE_fullSync() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Engine busy. Try again.');
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    RE_ensureHeaders_();

    var master = ss.getSheetByName('MASTER_PRODUCTS');
    var live = ss.getSheetByName('PRODUCTS_LIVE');
    var archive = ss.getSheetByName('Price_Archive');
    var qcQ = ss.getSheetByName('QC_QUEUE');

    var mp = RE_readTable_(master);
    if (!mp.rows.length) return; // nothing to process

    // Governance snapshot
    var gov = RE_computeCreditGovernance_(ss);

    var now = new Date();
    var updates = [];
    var liveRows = [];
    var archiveRows = [];
    var qcRows = [];

    for (var r=0;r<mp.rows.length;r++) {
      var row = mp.rows[r];
      // Normalize numeric fields
      var minPrice = RE_num_(row.Minimum_Price);
      if (minPrice <= 0) {
        row.Publish_Eligible = false;
        row.Publish_Reason = 'Minimum_Price missing/invalid';
        row.Updated_At = now;
        updates.push(row);
        continue;
      }

      // System_Cost rule: deterministic = Minimum_Price (since you chose Minimum as sole base)
      var systemCost = minPrice;

      // Loyalty: Retail = Minimum only
      var loyaltyEligible = RE_bool_(row.Loyalty_Eligible);
      var retail = loyaltyEligible ? minPrice : (minPrice * RE.RETAIL_MULT);

      // Missing lifecycle
      var lastConf = RE_parseDate_(row.Availability_last_confirmed_at);
      var daysSince = lastConf ? RE_daysBetween_(lastConf, now) : 9999;
      var missingCount = RE_int_(row.Missing_Count);

      var status = 'ACTIVE';
      var reason = '';

      if (daysSince > RE.MISSING_DAYS_2) {
        status = 'HIDDEN';
        missingCount = 2;
        reason = 'Month 2 missing (availability > 60d)';
      } else if (daysSince > RE.MISSING_DAYS_1) {
        status = 'ACTIVE';
        missingCount = 1;
        retail = retail * RE.MISSING_PREMIUM_MULT;
        reason = 'Month 1 missing premium (availability > 30d)';
      } else {
        missingCount = 0;
      }

      // Solar volatility pause
      var cat = String(row.Category || '').trim();
      var supplierCostLast = RE_num_(row.Supplier_Cost_Last);
      var supplierCostNow = systemCost; // base; if you store real supplier cost, swap here
      var volFlag = false;
      if (cat.toLowerCase() === 'solar' && supplierCostLast > 0) {
        if ((supplierCostNow - supplierCostLast) / supplierCostLast > RE.SOLAR_VOL_PCT) {
          volFlag = true;
          status = 'PAUSED';
          reason = 'Solar volatility > 15%: manual reconfirm required';
        }
      }

      // QC gating
      var qcRequired = false;
      if (RE.QC_CATS[cat] && retail >= RE.QC_THRESHOLD) qcRequired = true;
      var qcPassed = RE_bool_(row.QC_Passed);
      if (qcRequired && !qcPassed) {
        status = 'PAUSED';
        reason = 'QC required (>=100k) not passed';
        qcRows.push([now,row.Product_ID,cat,row.Model,RE_ceil500_(retail),true,false,row.QC_Serial||'',row.QC_PhotoPack_URL||'',reason]);
      }

      // Credit governance freeze (blocks credit approvals; publishing can continue)
      // Publishing eligibility
      var publishEligible = (status === 'ACTIVE');

      // Apply rounding always upward to 500
      systemCost = RE_ceil500_(systemCost);
      retail = RE_ceil500_(retail);

      // Write back computed fields
      row.System_Cost = systemCost;
      row.Retail_Price = retail;
      row.Missing_Count = missingCount;
      row.Solar_Volatility_Flag = volFlag ? 'TRUE' : 'FALSE';
      row.QC_Required = qcRequired ? 'TRUE' : 'FALSE';
      row.Status = status;
      row.Publish_Eligible = publishEligible ? 'TRUE' : 'FALSE';
      row.Publish_Reason = reason;
      row.Updated_At = now;

      updates.push(row);

      // Archive (only if you want every run; keep minimal)
      archiveRows.push([now,row.Product_ID,row.Brand,row.Category,row.Model,minPrice,systemCost,retail,reason||'sync']);

      // Build PRODUCTS_LIVE row if eligible
      if (publishEligible) {
        liveRows.push([
          row.Product_ID,row.Brand,row.Category,row.Model,
          retail,minPrice,systemCost,
          row.Availability || '',
          RE_buildInstallmentsJSON_(retail),
          qcRequired ? 'TRUE':'FALSE',
          status,
          row.Image_URL_1||'',row.Image_URL_2||'',
          row.Description||'',row.Specifications||'',row.Tags||'',
          now
        ]);
      }
    }

    // Write MASTER_PRODUCTS back (in place, stable headers)
    RE_writeTable_(master, mp.headers, updates);

    // Append Price_Archive (batch)
    if (archiveRows.length) archive.getRange(archive.getLastRow()+1,1,archiveRows.length,archiveRows[0].length).setValues(archiveRows);

    // QC_QUEUE append
    if (qcRows.length) qcQ.getRange(qcQ.getLastRow()+1,1,qcRows.length,qcRows[0].length).setValues(qcRows);

    // Replace PRODUCTS_LIVE body (keep header)
    RE_replaceBody_(live, liveRows);

  } finally {
    lock.releaseLock();
  }
}

/* ===========================
  HELPERS: TABLE IO
=========================== */

function RE_readTable_(sheet) {
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values[0];
  var rows = [];
  for (var i=1;i<values.length;i++) {
    var obj = {};
    for (var c=0;c<headers.length;c++) obj[String(headers[c])] = values[i][c];
    rows.push(obj);
  }
  return {headers: headers, rows: rows};
}

function RE_writeTable_(sheet, headers, rowObjs) {
  if (!rowObjs.length) return;
  var out = [];
  for (var i=0;i<rowObjs.length;i++) {
    var row = [];
    for (var c=0;c<headers.length;c++) row.push(rowObjs[i][String(headers[c])] || '');
    out.push(row);
  }
  // Ensure range size matches exactly
  sheet.getRange(2,1,out.length,headers.length).setValues(out);
  // Clear any extra old rows below
  var extra = sheet.getLastRow() - (out.length + 1);
  if (extra > 0) sheet.getRange(out.length+2,1,extra,headers.length).clearContent();
}

function RE_replaceBody_(sheet, bodyRows) {
  // Clear old body safely
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1) sheet.getRange(2,1,lastRow-1,lastCol).clearContent();
  if (!bodyRows.length) return;
  sheet.getRange(2,1,bodyRows.length,bodyRows[0].length).setValues(bodyRows);
}

/* ===========================
  HELPERS: MATH / DATES
=========================== */

function RE_ceil500_(n) {
  n = RE_num_(n);
  var step = RE.ROUND_STEP;
  return Math.ceil(n / step) * step;
}
function RE_num_(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
function RE_int_(v) { var n = parseInt(v,10); return isNaN(n) ? 0 : n; }
function RE_bool_(v) { return String(v).toUpperCase() === 'TRUE' || v === true; }

function RE_parseDate_(v) {
  if (!v) return null;
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime())) return v;
  var d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function RE_daysBetween_(d1, d2) {
  var ms = d2.getTime() - d1.getTime();
  return Math.floor(ms / (1000*60*60*24));
}

/* ===========================
  INSTALLMENT OPTIONS (placeholder multipliers)
  Replace with your Policy_Parameters keys if needed.
=========================== */
function RE_buildInstallmentsJSON_(retail) {
  // You can swap in your exact multipliers (2/3/6/12 months) from POLICY_PARAMETERS
  var plans = [
    {months:2, mult:1.08},
    {months:3, mult:1.12},
    {months:6, mult:1.22},
    {months:12,mult:1.40}
  ];
  var out = [];
  for (var i=0;i<plans.length;i++) {
    var total = RE_ceil500_(retail * plans[i].mult);
    var monthly = RE_ceil500_(total / plans[i].months);
    out.push({months:plans[i].months,total:total,monthly:monthly});
  }
  return JSON.stringify(out);
}

/* ===========================
  CREDIT GOVERNANCE SNAPSHOT
=========================== */

function RE_computeCreditGovernance_(ss) {
  var orders = ss.getSheetByName('ORDERS');
  var t = RE_readTable_(orders);

  var lifetimeRevenue = 0;
  var outstandingPrincipal = 0;
  var outstandingOverdue = 0;

  for (var i=0;i<t.rows.length;i++) {
    var row = t.rows[i];
    var total = RE_num_(row.Total);
    lifetimeRevenue += total;

    outstandingPrincipal += RE_num_(row.Outstanding_Principal);

    // if you store overdue separately, use that; otherwise keep 0 for now
    // outstandingOverdue += ...
  }

  var cap = lifetimeRevenue * RE.CREDIT_CAP_PCT;
  var capBreached = outstandingPrincipal > cap;
  var overdueFreeze = outstandingPrincipal > 0 && (outstandingOverdue > (outstandingPrincipal * RE.OVERDUE_FREEZE_PCT));

  var cg = ss.getSheetByName('CREDIT_GOVERNANCE');
  cg.appendRow([new Date(), lifetimeRevenue, outstandingPrincipal, outstandingOverdue, cap, capBreached?'TRUE':'FALSE', overdueFreeze?'TRUE':'FALSE','']);

  return {lifetimeRevenue:lifetimeRevenue,outstandingPrincipal:outstandingPrincipal,capBreached:capBreached,overdueFreeze:overdueFreeze};
}

/* ===========================
  WEB APP: API + WHATSAPP WEBHOOK
  Deploy as Web App
=========================== */

function doGet(e) {
  var path = (e && e.parameter && e.parameter.path) ? e.parameter.path : '';

  // Meta verify
  if (e && e.parameter && e.parameter['hub.mode'] === 'subscribe') {
    var token = RE_getProp_('META_VERIFY_TOKEN');
    if (e.parameter['hub.verify_token'] === token) {
      return ContentService.createTextOutput(e.parameter['hub.challenge']).setMimeType(ContentService.MimeType.TEXT);
    }
    return ContentService.createTextOutput('Verify token mismatch').setMimeType(ContentService.MimeType.TEXT);
  }

  if (path === 'api/products') return RE_apiProducts_();
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var path = (e && e.parameter && e.parameter.path) ? e.parameter.path : '';

  if (path === 'api/order') return RE_apiCreateOrder_(e);

  // WhatsApp inbound webhook
  RE_logWhatsAppInbound_(e);
  return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
}

function RE_apiProducts_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var live = ss.getSheetByName('PRODUCTS_LIVE');
  var t = RE_readTable_(live);

  var items = [];
  for (var i=0;i<t.rows.length;i++) {
    var r = t.rows[i];
    items.push({
      id:r.Product_ID, brand:r.Brand, category:r.Category, model:r.Model,
      retail:Number(r.Retail_Price), min:Number(r.Minimum_Price), status:r.Status,
      availability:r.Availability,
      installments: r.Installment_Options_JSON ? JSON.parse(r.Installment_Options_JSON) : [],
      img1:r.Image_URL_1, img2:r.Image_URL_2,
      desc:r.Description, specs:r.Specifications, tags:r.Tags,
      updated_at:r.Updated_At
    });
  }
  return ContentService.createTextOutput(JSON.stringify({items:items})).setMimeType(ContentService.MimeType.JSON);
}

function RE_apiCreateOrder_(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orders = ss.getSheetByName('ORDERS');

  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch(ex) {}

  // Minimal validation
  var orderId = 'O-' + new Date().getTime();
  var createdAt = new Date();
  var customerId = body.customer_id || '';
  var phone = body.customer_phone || '';
  var mode = body.mode || 'lead';
  var itemsJson = JSON.stringify(body.items || []);
  var subtotal = RE_num_(body.subtotal);
  var discount = RE_num_(body.discount);
  var total = RE_ceil500_(subtotal - discount);
  var advance = RE_num_(body.advance);
  var months = RE_int_(body.installment_months);
  var monthly = months > 0 ? RE_ceil500_( (total - advance) / months ) : 0;
  var outstanding = months > 0 ? (total - advance) : 0;

  orders.appendRow([
    orderId, createdAt, customerId, phone,
    mode, itemsJson, subtotal, discount, total,
    advance, months, monthly, outstanding,
    'CREATED',''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ok:true,order_id:orderId,total:total,monthly:monthly}))
    .setMimeType(ContentService.MimeType.JSON);
}

function RE_logWhatsAppInbound_(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bot = ss.getSheetByName('BOT_TRANSCRIPTS');

  var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '';
  if (!raw) return;

  var obj = {};
  try { obj = JSON.parse(raw); } catch(ex) { obj = {}; }

  // Best-effort extraction
  var from = '';
  var msg = '';
  var typ = '';
  try {
    var entry = obj.entry && obj.entry[0];
    var changes = entry.changes && entry.changes[0];
    var value = changes.value;
    var messages = value.messages && value.messages[0];
    if (messages) {
      from = messages.from || '';
      typ = messages.type || '';
      if (typ === 'text') msg = (messages.text && messages.text.body) ? messages.text.body : '';
      else msg = JSON.stringify(messages);
    }
  } catch(ex2) {}

  bot.appendRow([new Date(), from, typ, msg, raw, 'FALSE']);
}

function RE_getProp_(k) {
  return PropertiesService.getScriptProperties().getProperty(k) || '';
}
