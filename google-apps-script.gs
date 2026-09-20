/**
 * MARGWAY INSTITUTE — Google Sheet Lead Logger
 * ---------------------------------------------
 * This script receives data from index.html (demo form submissions,
 * "Call Now" clicks, and WhatsApp clicks) and appends a row to a
 * Google Sheet for every one of them.
 *
 * SETUP:
 * 1. Go to https://sheet.new to create a new Google Sheet
 *    (or open an existing one you want to use for leads).
 * 2. In that Sheet, go to Extensions -> Apps Script.
 * 3. Delete any starter code in the editor and paste this entire file.
 * 4. Click "Save" (disk icon), name the project e.g. "Margway Leads".
 * 5. Click "Deploy" -> "New deployment".
 *      - Click the gear icon next to "Select type" and choose "Web app".
 *      - Description: "Margway lead logger"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 * 6. Click "Deploy". Google will ask you to authorize the script —
 *    approve it (choose your account, click "Advanced" ->
 *    "Go to Margway Leads (unsafe)" -> "Allow" if a warning screen appears;
 *    this is normal for your own scripts).
 * 7. Copy the "Web app URL" that is shown after deployment.
 *    It looks like:
 *    https://script.google.com/macros/s/AKfycb..................../exec
 * 8. Paste that URL into index.html where it says:
 *    const GOOGLE_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
 * 9. (Optional but recommended) Run the `setupSheet` function once from
 *    the Apps Script editor (select it in the function dropdown, click
 *    "Run") so the header row is created automatically.
 *
 * If you ever edit this script again, you must create a
 * "New deployment" (or Manage deployments -> Edit -> New version) for
 * the changes to go live on the same URL.
 */

const SHEET_NAME = "Leads"; // change if you want a different tab name

/**
 * Run this once manually from the Apps Script editor to create the
 * sheet tab and header row.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  const headers = [
    "Timestamp",
    "Type",
    "Student Name",
    "Parent/Guardian Name",
    "Class",
    "Stream of Interest",
    "Phone",
    "City",
    "Message",
    "Page URL",
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

/**
 * Handles incoming POST requests from index.html
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.type || "",
      data.studentName || "",
      data.parentName || "",
      data.studentClass || "",
      data.streamInterest || "",
      data.phone || "",
      data.city || "",
      data.message || "",
      data.pageUrl || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Lets you sanity-check the deployment by opening the Web app URL
 * directly in a browser — it should show this message.
 */
function doGet(e) {
  return ContentService.createTextOutput(
    "Margway Institute lead logger is running."
  );
}
