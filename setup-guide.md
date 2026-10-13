# Setup Guide
## Retail Sales Analytics & Automated Data Quality Monitoring

This guide explains how to configure and run the project using Google Sheets and Google Apps Script.

## 1. Prerequisites

Before starting, make sure you have:

- A Google account.
- Access to Google Sheets.
- Access to Google Apps Script.
- The retail sales dataset used by this project.
- Permission to authorize the script to access the spreadsheet and send emails.

## 2. Prepare the Google Sheet

1. Create a new Google Spreadsheet or open an existing one.
2. Import the retail sales dataset.
3. Rename the source worksheet to:

   `retail_sales_dataset`

4. Make sure the first row contains these headers in the exact order:

   - Transaction ID
   - Date
   - Customer ID
   - Gender
   - Age
   - Product Category
   - Quantity
   - Price per Unit
   - Total Amount

5. Ensure the dataset does not contain unintended blank rows or columns.

## 3. Configure Google Apps Script

1. Open the spreadsheet.
2. Navigate to **Extensions → Apps Script**.
3. Open `Code.gs`.
4. Copy the project code from the repository into the script editor.
5. Update the recipient email in the configuration:

   `RECIPIENT_EMAIL`

6. Save the project.

**Security note:** Only use an email address you are authorized to send reports to. Do not publish personal email addresses or private spreadsheet links in a public repository.

## 4. Run the Data Quality Check

1. In the Apps Script editor, select:

   `runDailyDataQualityAutomation`

2. Click **Run**.
3. Review and approve the requested Google permissions.
4. Wait for the execution to finish.
5. Return to the spreadsheet.

The script should create or update these worksheets:

- `Data Quality Report`
- `Data Quality Issues`

## 5. Verify the Results

Open the `Data Quality Report` worksheet and review:

- Check Date
- Transactions Scanned
- Issues Found
- Status
- Source Sheet

Then open `Data Quality Issues` to inspect any detected problems.

The status is `PASS` when no issues are detected and `ACTION REQUIRED` when issues are found.

## 6. Configure Daily Automation

To schedule the workflow:

1. Open the Apps Script project.
2. Select **Triggers** from the left sidebar.
3. Click **Add Trigger**.
4. Choose the function:

   `runDailyDataQualityAutomation`

5. Select **Time-driven** as the event source.
6. Choose a daily timer and a suitable time window.
7. Save the trigger.

If a trigger for this function already exists, verify it rather than creating a duplicate.

Google Apps Script runs the trigger according to its scheduling rules; execution time may vary within the selected window.

## 7. Email Notifications

After a successful validation run, the script sends an email containing:

- Validation status
- Check date and time
- Number of transactions scanned
- Number of issues found
- Links to the spreadsheet and detailed issues report

If the email does not arrive, check the Apps Script execution history, authorization status, recipient address, and spam folder.

## 8. Troubleshooting

### Source sheet not found
Check that the source worksheet is named exactly `retail_sales_dataset`.

### Header validation error
Confirm that all nine column headers match the expected names and order.

### Email not received
Check the recipient email, script permissions, execution history, and spam folder.

### Trigger not running
Open the Triggers page and verify the selected function, schedule, and recent execution results.

### Duplicate triggers
Keep only the intended daily trigger for `runDailyDataQualityAutomation`.

## 9. Important Notes

- GitHub stores the source code; it does not run the automation.
- Google Apps Script executes the checks and sends the email.
- The project must be authorized by the Google account running it.
- Results depend on the current source data.
- Do not upload confidential or personally identifiable data to a public repository.

