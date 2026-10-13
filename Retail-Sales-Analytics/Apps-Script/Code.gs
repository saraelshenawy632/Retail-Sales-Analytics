
/**
 * RETAIL SALES ANALYTICS
 * Automated Data Quality Monitoring
 *
 * Source sheet: retail_sales_dataset
 * Summary sheet: Data Quality Report
 * Detailed issues sheet: Data Quality Issues
 */

const CONFIG = {
  SOURCE_SHEET: "retail_sales_dataset",
  REPORT_SHEET: "Data Quality Report",
  ISSUES_SHEET: "Data Quality Issues",
  RECIPIENT_EMAIL: "your_email@gmail.com",

  // Dataset column positions (1-based)
  COLUMNS: {
    TRANSACTION_ID: 1,
    DATE: 2,
    CUSTOMER_ID: 3,
    GENDER: 4,
    AGE: 5,
    CATEGORY: 6,
    QUANTITY: 7,
    PRICE: 8,
    TOTAL: 9
  },

  EXPECTED_HEADERS: [
    "Transaction ID",
    "Date",
    "Customer ID",
    "Gender",
    "Age",
    "Product Category",
    "Quantity",
    "Price per Unit",
    "Total Amount"
  ],

  EMAIL_SUBJECT_PREFIX: "Retail Sales | Data Quality"
};


/**
 * 1. DATA QUALITY CHECK
 * Validates the source data and updates both reports.
 */
function runDataQualityCheck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const source = ss.getSheetByName(CONFIG.SOURCE_SHEET);

  if (!source) {
    throw new Error(
      'Source sheet not found: ' + CONFIG.SOURCE_SHEET
    );
  }

  const values = source.getDataRange().getValues();

  if (values.length < 1) {
    throw new Error("The source sheet is empty.");
  }

  const headers = values[0].map(function (value) {
    return String(value).trim();
  });

  const headersValid = CONFIG.EXPECTED_HEADERS.every(
    function (expected, index) {
      return headers[index] === expected;
    }
  );

  if (!headersValid) {
    throw new Error(
      "The source column names do not match the expected headers. " +
      "Please check row 1 of " + CONFIG.SOURCE_SHEET + "."
    );
  }

  const rows = values.slice(1);
  const issues = [];
  const seenTransactionIds = new Map();

  function addIssue(rowNumber, transactionId, type, column, value, details) {
    issues.push([
      rowNumber,
      transactionId === "" ? "(missing)" : transactionId,
      type,
      column,
      value === "" || value === null ? "(blank)" : String(value),
      details
    ]);
  }

  function isBlank(value) {
    return value === "" || value === null ||
      typeof value === "undefined" ||
      (typeof value === "string" && value.trim() === "");
  }

  function isValidDate(value) {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    if (isBlank(value)) {
      return false;
    }

    return !isNaN(new Date(value).getTime());
  }

  function numericValue(value) {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }

    return NaN;
  }

  rows.forEach(function (row, index) {
    const rowNumber = index + 2;
    const c = CONFIG.COLUMNS;

    const transactionId = row[c.TRANSACTION_ID - 1];
    const transactionKey = String(transactionId).trim();

    // Check missing cells in all 9 expected columns.
    CONFIG.EXPECTED_HEADERS.forEach(function (header, colIndex) {
      if (isBlank(row[colIndex])) {
        addIssue(
          rowNumber,
          transactionId,
          "Missing Value",
          header,
          row[colIndex],
          "Required field is empty."
        );
      }
    });

    // Duplicate transaction IDs.
    if (!isBlank(transactionId)) {
      if (seenTransactionIds.has(transactionKey)) {
        addIssue(
          rowNumber,
          transactionId,
          "Duplicate Transaction ID",
          "Transaction ID",
          transactionId,
          "First occurrence is on row " +
            seenTransactionIds.get(transactionKey) + "."
        );
      } else {
        seenTransactionIds.set(transactionKey, rowNumber);
      }
    }

    // Date validation.
    const dateValue = row[c.DATE - 1];
    if (!isBlank(dateValue) && !isValidDate(dateValue)) {
      addIssue(
        rowNumber, transactionId, "Invalid Date",
        "Date", dateValue, "Date cannot be interpreted."
      );
    }

    // Gender validation.
    const gender = String(row[c.GENDER - 1]).trim().toLowerCase();
    if (!isBlank(row[c.GENDER - 1]) &&
        !["male", "female"].includes(gender)) {
      addIssue(
        rowNumber, transactionId, "Invalid Gender",
        "Gender", row[c.GENDER - 1],
        "Expected Male or Female."
      );
    }

    // Age validation.
    const age = numericValue(row[c.AGE - 1]);
    if (!isBlank(row[c.AGE - 1]) &&
        (!Number.isFinite(age) || age < 1 || age > 120)) {
      addIssue(
        rowNumber, transactionId, "Invalid Age",
        "Age", row[c.AGE - 1],
        "Age must be a number between 1 and 120."
      );
    }

    // Product category validation.
    if (!isBlank(row[c.CATEGORY - 1]) &&
        String(row[c.CATEGORY - 1]).trim() === "") {
      addIssue(
        rowNumber, transactionId, "Invalid Category",
        "Product Category", row[c.CATEGORY - 1],
        "Product category cannot be empty."
      );
    }

    // Quantity validation.
    const quantity = numericValue(row[c.QUANTITY - 1]);
    if (!isBlank(row[c.QUANTITY - 1]) &&
        (!Number.isFinite(quantity) ||
         quantity <= 0 || !Number.isInteger(quantity))) {
      addIssue(
        rowNumber, transactionId, "Invalid Quantity",
        "Quantity", row[c.QUANTITY - 1],
        "Quantity must be a positive whole number."
      );
    }

    // Price validation.
    const price = numericValue(row[c.PRICE - 1]);
    if (!isBlank(row[c.PRICE - 1]) &&
        (!Number.isFinite(price) || price <= 0)) {
      addIssue(
        rowNumber, transactionId, "Invalid Price",
        "Price per Unit", row[c.PRICE - 1],
        "Price must be a positive number."
      );
    }

    // Total amount validation.
    const total = numericValue(row[c.TOTAL - 1]);
    if (!isBlank(row[c.TOTAL - 1]) &&
        (!Number.isFinite(total) || total <= 0)) {
      addIssue(
        rowNumber, transactionId, "Invalid Total Amount",
        "Total Amount", row[c.TOTAL - 1],
        "Total amount must be a positive number."
      );
    }

    // Check total = quantity * unit price when both inputs are valid.
    if (
      !isBlank(row[c.QUANTITY - 1]) &&
      !isBlank(row[c.PRICE - 1]) &&
      !isBlank(row[c.TOTAL - 1]) &&
      Number.isFinite(quantity) &&
      Number.isFinite(price) &&
      Number.isFinite(total) &&
      quantity > 0 &&
      price > 0 &&
      total > 0
    ) {
      const expectedTotal = Math.round(quantity * price * 100) / 100;
      const actualTotal = Math.round(total * 100) / 100;

      if (Math.abs(expectedTotal - actualTotal) > 0.01) {
        addIssue(
          rowNumber,
          transactionId,
          "Total Amount Mismatch",
          "Total Amount",
          total,
          "Expected " + expectedTotal +
            " from Quantity × Price per Unit."
        );
      }
    }
  });

  const checkedAt = new Date();
  const status = issues.length === 0 ? "PASS" : "ACTION REQUIRED";

  // Update summary report.
  const report = getOrCreateSheet_(ss, CONFIG.REPORT_SHEET);
  report.clearContents();
  report.clearFormats();

  const summary = [
    ["Metric", "Value"],
    ["Check Date", checkedAt],
    ["Transactions Scanned", rows.length],
    ["Issues Found", issues.length],
    ["Status", status],
    ["Source Sheet", CONFIG.SOURCE_SHEET]
  ];

  report.getRange(1, 1, summary.length, 2).setValues(summary);
  report.getRange("A1:B1")
    .setFontWeight("bold")
    .setBackground("#8E4585")
    .setFontColor("#FFFFFF");

  report.getRange("A2:A6").setFontWeight("bold");
  report.getRange("B2").setNumberFormat("yyyy-mm-dd hh:mm:ss");
  report.autoResizeColumns(1, 2);
  report.setFrozenRows(1);

  // Update detailed issue log.
  const issueSheet = getOrCreateSheet_(ss, CONFIG.ISSUES_SHEET);
  issueSheet.clearContents();
  issueSheet.clearFormats();

  const issueHeaders = [
    "Source Row",
    "Transaction ID",
    "Issue Type",
    "Column",
    "Value",
    "Details"
  ];

  issueSheet.getRange(1, 1, 1, issueHeaders.length)
    .setValues([issueHeaders]);
issueSheet.getRange(1, 1, 1, issueHeaders.length)
    .setFontWeight("bold")
    .setBackground("#8E4585")
    .setFontColor("#FFFFFF");

  if (issues.length > 0) {
    issueSheet.getRange(2, 1, issues.length, issueHeaders.length)
      .setValues(issues);
  } else {
    issueSheet.getRange(2, 1).setValue("No data quality issues found.");
  }

  issueSheet.setFrozenRows(1);
  issueSheet.autoResizeColumns(1, issueHeaders.length);

  // Keep a filter on the detailed issue table.
  if (issueSheet.getFilter()) {
    issueSheet.getFilter().remove();
  }

  if (issues.length > 0) {
    issueSheet.getRange(
      1, 1, issues.length + 1, issueHeaders.length
    ).createFilter();
  }

  SpreadsheetApp.flush();

  return {
    checkedAt: checkedAt,
    transactionsScanned: rows.length,
    issuesFound: issues.length,
    status: status
  };
}


/**
 * 2. EMAIL REPORT
 * Sends the latest report summary and spreadsheet link.
 */
function sendDataQualityEmail() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = ss.getSheetByName(CONFIG.REPORT_SHEET);

  if (!report) {
    throw new Error(
      "Data Quality Report not found. Run the quality check first."
    );
  }

  const reportData = report.getRange("A1:B6").getValues();

  const checkedAt = reportData[1][1];
  const transactionsScanned = reportData[2][1];
  const issuesFound = Number(reportData[3][1]);
  const status = String(reportData[4][1]);

  if (!(checkedAt instanceof Date) || isNaN(checkedAt.getTime())) {
    throw new Error(
      "The report date is missing or invalid. Run the quality check first."
    );
  }

  const recipient = CONFIG.RECIPIENT_EMAIL;
  const timeZone = ss.getSpreadsheetTimeZone();
  const formattedDate = Utilities.formatDate(
    checkedAt, timeZone, "yyyy-MM-dd HH:mm:ss"
  );

  const subject =
    CONFIG.EMAIL_SUBJECT_PREFIX + " | " + status;

  const reportUrl = ss.getUrl();
  const issuesUrl = reportUrl + "#range='Data%20Quality%20Issues'!A1";

  const message =
    "Hello,\n\n" +
    "Your Retail Sales data quality check has completed.\n\n" +
    "STATUS: " + status + "\n" +
    "Check Date: " + formattedDate + "\n" +
    "Transactions Scanned: " + transactionsScanned + "\n" +
    "Issues Found: " + issuesFound + "\n\n" +
    (issuesFound === 0
      ? "No data quality issues were found.\n\n"
      : "Please review the detailed issues report and correct the affected data.\n\n") +
    "Google Sheet:\n" + reportUrl + "\n\n" +
    "Detailed Issues Sheet:\n" + issuesUrl + "\n\n" +
    "Automated message from the Retail Sales Analytics project.";

  const htmlBody =
    '<div style="font-family:Arial,sans-serif;max-width:650px;">' +
      '<h2 style="color:#1F4E78;">Retail Sales Data Quality Report</h2>' +
      '<p>Your automated data quality check has completed.</p>' +
      '<table style="border-collapse:collapse;width:100%;">' +
        emailRow_("Status", status) +
        emailRow_("Check Date", formattedDate) +
        emailRow_("Transactions Scanned", transactionsScanned) +
        emailRow_("Issues Found", issuesFound) +
      '</table>' +
      '<p style="margin-top:20px;">' +
        (issuesFound === 0
          ? '<strong>No data quality issues were found.</strong>'
          : '<strong>Please review the detailed issues report.</strong>') +
      '</p>' +
      '<p><a href="' + reportUrl + '">Open Google Sheet and Summary Report</a></p>' +
      '<p><a href="' + issuesUrl + '">Open Detailed Issues Report</a></p>' +
      '<hr>' +
      '<p style="color:#666;font-size:12px;">' +
        'Automated message from the Retail Sales Analytics project.' +
      '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    body: message,
    htmlBody: htmlBody
  });

  // No UI alert here: this function must also work from a time trigger.
}


/**
 * 3. DAILY AUTOMATION
 * Runs the quality check first, then emails the fresh report.
 * If the check fails, execution stops and no old report is emailed.
 */
function runDailyDataQualityAutomation() {
  const result = runDataQualityCheck();

  // Only send the email after the check has completed successfully.
  sendDataQualityEmail();

  console.log(
    "Daily automation completed. Status: " + result.status +
    ", rows scanned: " + result.transactionsScanned +
    ", issues found: " + result.issuesFound
  );

  return result;
}


/**
 * Helper: creates a sheet if it does not exist.
 */
function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}


/**
 * Helper: formats a row in the HTML email.
 */
function emailRow_(label, value) {
  return (
    '<tr>' +
      '<td style="border:1px solid #ddd;padding:10px;font-weight:bold;">' +
        escapeHtml_(label) +
      '</td>' +
      '<td style="border:1px solid #ddd;padding:10px;">' +
        escapeHtml_(String(value)) +
      '</td>' +
    '</tr>'
  );
}


/**
 * Helper: safely escapes text before adding it to HTML.
 */
function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
