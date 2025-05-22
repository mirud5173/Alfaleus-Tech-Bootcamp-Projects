console.log("WhatsBlitz content script injected!");

window.addEventListener("load", () => {
  const interval = setInterval(() => {
    const chatArea = document.querySelector('[contenteditable="true"]');
    if (chatArea) {
      console.log("WhatsApp Web detected ✔️");
      clearInterval(interval);
    }
  }, 1000);
});
