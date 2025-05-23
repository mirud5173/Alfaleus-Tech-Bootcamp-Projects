(function waitForStore() {
  if (window.Store && window.Store.Chat && window.Store.Contact) {
    // Store is ready, run your code
    initWhatsBlitz();
  } else {
    // Wait and check again after 100ms
    setTimeout(waitForStore, 100);
  }
})();

function initWhatsBlitz() {
  // Your existing inject.js code but inside this function

  window.sendWhatsBlitzMessage = async function(phoneNumber, message) {
    const id = phoneNumber.includes('@c.us') ? phoneNumber : phoneNumber + "@c.us";

    const contact = await Store.Contact.find(id);
    const chat = await Store.Chat.find(id);

    if (!chat) {
      console.error("Chat not found for", id);
      return;
    }

    chat.sendMessage(message).then(() => {
      console.log("✅ Message sent to", id);
    }).catch((err) => {
      console.error("❌ Failed to send message:", err);
    });
  };

  console.log("✅ WhatsBlitz inject.js loaded");
}
