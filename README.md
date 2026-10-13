#  Retail Sales Analytics & Automated Data Quality Monitoring

## 📌 Project Overview

This project combines retail sales analytics with automated data quality monitoring using **Google Sheets** and **Google Apps Script**.

It provides an interactive sales dashboard to track key performance indicators (KPIs), analyze sales trends, and monitor data quality through automated validation reports and email notifications.

## 🛠️ Tools & Technologies

- Google Sheets
- Google Apps Script
- JavaScript
- Data Cleaning & Validation
- Data Quality Monitoring
- KPI Reporting & Data Visualization
- Email Automation
- Time-driven Triggers

## 📊 Dataset Overview

The project uses a retail sales dataset containing **1,000 transactions** and the following fields:

| Column | Description |
|---|---|
| Transaction ID | Unique transaction identifier |
| Date | Transaction date |
| Customer ID | Customer identifier |
| Gender | Customer gender |
| Age | Customer age |
| Product Category | Purchased product category |
| Quantity | Number of units purchased |
| Price per Unit | Price of one unit |
| Total Amount | Total transaction amount |

## 📈 Sales Dashboard

The dashboard provides an overview of retail sales performance through KPIs and visualizations.

### Key Performance Indicators (KPIs)

- **Total Sales:** Overall sales revenue.
- **Total Transactions:** Number of recorded transactions.
- **Average Transaction Value:** Average sales amount per transaction.
- **Total Units Sold:** Total quantity of products sold.

### Data Visualizations

- Sales by Product Category
- Monthly Sales Trend
- Sales by Gender

## 🔍 Automated Data Quality Monitoring

Google Apps Script automatically validates the source dataset to identify common data quality issues.

### Validation Rules

- Missing required values
- Duplicate transaction IDs
- Invalid dates
- Invalid gender values
- Invalid ages
- Invalid quantities
- Invalid unit prices
- Invalid total amounts
- Mismatches between quantity × unit price and total amount

## 📋 Automated Reporting

The automation maintains two reporting sheets:

**1. Data Quality Report**

Provides a summary of the latest validation run, including:
- Check Date
- Transactions Scanned
- Issues Found
- Validation Status
- Source Sheet

**2. Data Quality Issues**

Provides a detailed log of detected issues, including the source row, transaction ID, issue type, affected column, value, and explanation.

## 📧 Email Notifications

After a successful validation run, the script sends an email containing:

- Validation status (`PASS` or `ACTION REQUIRED`)
- Check date and time
- Number of transactions scanned
- Number of issues detected
- Links to the summary and detailed reports

The email notification uses a purple-themed design consistent with the reporting sheets.

## ⚙️ Automation Workflow

1. Read the source dataset from Google Sheets.
2. Validate required fields and data rules.
3. Identify and record data quality issues.
4. Update the summary report.
5. Update the detailed issues report.
6. Send an email with the latest results.
7. Run the workflow automatically using a time-driven trigger.

## ✅ Sample Validation Result

The following result was observed during a successful test run:

| Metric | Result |
|---|---:|
| Transactions Scanned | 1,000 |
| Issues Found | 0 |
| Status | PASS |

*This is a sample execution result. Future results depend on the current source data.*

## 🚀 Setup & Execution

1. Import the retail sales dataset into Google Sheets.
2. Name the source worksheet `retail_sales_dataset`.
3. Open **Extensions → Apps Script**.
4. Add the script to `Code.gs`.
5. Configure the recipient email in the script.
6. Save the project.
7. Run `runDailyDataQualityAutomation` and authorize the required permissions.
8. Verify that the summary and detailed issue reports are updated.
9. Create a daily time-driven trigger for `runDailyDataQualityAutomation`.
10. Confirm that the email notification is received.

### Expected Source Headers

The source sheet must contain these headers in the expected order:

`Transaction ID`, `Date`, `Customer ID`, `Gender`, `Age`, `Product Category`, `Quantity`, `Price per Unit`, `Total Amount`.

## 📁 Repository Structure

```text
Retail-Sales-Analytics/
├── Apps-Script/
│   └── Code.gs
├── screenshots/
│   ├── dashboard.png
│   ├── data-quality-report.png
│   └── email-report.png
├── README.md
└── setup-guide.md
```

## 🔐 Security & Notes

- Do not publish personal email addresses or private spreadsheet links.
- Do not upload sensitive customer information.
- Replace personal configuration values with placeholders in the public repository.
- GitHub stores the source code but does not execute Google Apps Script triggers.
- The daily automation runs within the configured Google Apps Script project.


Interested in Data Analytics, Business Intelligence, and Data Engineering.
