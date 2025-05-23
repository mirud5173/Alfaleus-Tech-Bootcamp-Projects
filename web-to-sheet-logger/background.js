chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  chrome.contextMenus.create({
    id: "saveToSheet",
    title: "Save to Google Sheet",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveToSheet" && info.selectionText) {
    const data = {
      text: info.selectionText,
      title: tab.title || '',
      url: tab.url,
      timestamp: new Date().toISOString(),
      color: "None" // context menu doesn't have color info
    };

    // Send data directly to Google Sheets Web App
    fetch("https://script.google.com/macros/s/AKfycbzDoR4Pmo8roF-Ktmv36gPypI5X9AT-YNLZMMm64lUzTorTBAEdwR2bn6GGG2t4Mkgksw/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(() => console.log("Context Menu: Data sent to Google Sheet"))
    .catch(err => console.error("Context Menu: Failed to send data:", err));
  }
});

// Listen to messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "save_to_sheet" && request.data) {
    fetch("https://script.google.com/macros/s/AKfycbzDoR4Pmo8roF-Ktmv36gPypI5X9AT-YNLZMMm64lUzTorTBAEdwR2bn6GGG2t4Mkgksw/exec", {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(request.data)
    })
    .then(() => {
      console.log("Background: Data sent to Google Sheet", request.data);
      sendResponse({status: "success"});
    })
    .catch((error) => {
      console.error("Background: Failed to send data", error);
      sendResponse({status: "error", message: error.toString()});
    });

    // Return true to indicate async sendResponse
    return true;
  }
});
