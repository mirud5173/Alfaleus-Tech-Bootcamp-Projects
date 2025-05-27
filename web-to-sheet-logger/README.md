# 📝 Web-to-Sheet Logger

**Web-to-Sheet Logger** is a simple yet powerful Chrome extension that allows users to highlight text on any webpage and save it directly to a connected Google Sheet with optional color-coded tags and metadata.

---

## 🚀 Features

- 📋 Highlight text and instantly save it to your Google Sheet
- 🏷️ Assign color tags before saving
- 🌐 Captures page title and URL automatically
- 🕒 Saves timestamp in IST (Indian Standard Time)
- 📄 Stores data in a structured format via Google Apps Script
- ⚡ Lightweight, fast, and works on all websites

---

## 🛠️ Installation

### 1. Clone the Repository

```
git clone https://github.com/<your-username>/web-to-sheet-logger.git
cd web-to-sheet-logger
```
### 2. Set Up Google Apps Script
Open Google Sheets and rename the first sheet to Sheet1

Go to Extensions > Apps Script and paste the script below:

```
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Sheet1');
  const data = JSON.parse(e.postData.contents);

  const utcDate = new Date(data.timestamp);
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffsetMs);

  const formattedIST = Utilities.formatDate(istDate, "Asia/Kolkata", "dd-MM-yyyy HH:mm:ss");

  sheet.appendRow([
    formattedIST,
    data.text,
    data.title,
    data.url,
    data.color
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Click Deploy > Manage Deployments > New Deployment

### 4. Select Web App, set:

  - Execute as: Me

  - Who has access: Anyone

### 5. Click Deploy and copy the web app URL

🔧 Configure the Extension
### 1. In background.js, replace the placeholder URL:

```
fetch("https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec", {
  method: "POST",
  mode: "no-cors",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
});
```
### 2. Save your changes

### 🧩 Load the Extension in Chrome
1. Open chrome://extensions

2. Enable Developer mode

3. Click Load unpacked

4. Select the web-to-sheet-logger directory

### 📁 Project Structure
```
web-to-sheet-logger/
├── background.js
├── content.js
├── manifest.json
├── styles.css
├── icons/
│   └── icon.png
└── README.md
```
### 💡 Usage
 - Highlight any text on a webpage

 - A “Save to Sheet” button appears

 - Click the button and choose a color

 - Your selection and metadata will be stored in your Google Sheet

### 🔐 Permissions Used
"activeTab", "contextMenus", "scripting" – to interact with current tab and create context menu

"host_permissions": ["<all_urls>"] – to enable use on all websites

### 🔒 Privacy & Security
This extension does not collect any personal data or send any information to third-party servers. All data is sent only to your linked Google Sheet.

### 🧑‍💻 Author
Developed by Mirudhula.
Feel free to fork, improve, and share feedback or feature ideas!
