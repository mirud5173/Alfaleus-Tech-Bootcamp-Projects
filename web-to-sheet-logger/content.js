document.addEventListener("mouseup", (e) => {
  const target = e.target;

  if (
    target &&
    (target.id === "web2sheet-save-btn" || target.classList.contains("web2sheet-color-btn"))
  ) return;

  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    const x = e.pageX;
    const y = e.pageY;
    showSaveButton(selection, x, y);
  } else {
    removeElements();
  }
});

function showSaveButton(text, x, y) {
  removeElements();

  const btn = document.createElement("button");
  btn.id = "web2sheet-save-btn";
  btn.innerText = "Save to Sheet";
  btn.style.position = "absolute";
  btn.style.top = `${y + 10}px`;
  btn.style.left = `${x}px`;
  btn.style.zIndex = "9999";
  btn.style.padding = "8px 12px";
  btn.style.borderRadius = "5px";
  btn.style.border = "none";
  btn.style.background = "#4caf50";
  btn.style.color = "#fff";
  btn.style.fontSize = "14px";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";

  btn.addEventListener("click", () => {
    showColorPicker(text, btn);
  });

  document.body.appendChild(btn);
}

function showColorPicker(selectedText, button) {
  removeColorPicker();

  const rect = button.getBoundingClientRect();
  const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"]; // red, blue, green, orange, purple

  const wrapper = document.createElement("div");
  wrapper.id = "web2sheet-color-picker";
  wrapper.style.position = "absolute";
  wrapper.style.top = `${rect.bottom + window.scrollY + 5}px`;
  wrapper.style.left = `${rect.left + window.scrollX}px`;
  wrapper.style.zIndex = "9999";
  wrapper.style.display = "flex";
  wrapper.style.gap = "6px";
  wrapper.style.background = "#fff";
  wrapper.style.padding = "6px";
  wrapper.style.border = "1px solid #ccc";
  wrapper.style.borderRadius = "6px";
  wrapper.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  colors.forEach((color) => {
    const colorBtn = document.createElement("button");
    colorBtn.className = "web2sheet-color-btn";
    colorBtn.style.width = "24px";
    colorBtn.style.height = "24px";
    colorBtn.style.borderRadius = "50%";
    colorBtn.style.border = "2px solid #fff";
    colorBtn.style.outline = "1px solid #ccc";
    colorBtn.style.background = color;
    colorBtn.style.cursor = "pointer";

    colorBtn.addEventListener("click", () => {
    // Map color hex to names for clearer console logs
    const colorNames = {
        "#f44336": "Red",
        "#2196f3": "Blue",
        "#4caf50": "Green",
        "#ff9800": "Orange",
        "#9c27b0": "Purple"
    };

    const colorName = colorNames[color] || color; // fallback to hex if no name found

    console.log(`Highlighted Text: %c${selectedText}`, `background-color: ${color}; color: #000; padding: 2px 4px; border-radius: 2px;`);
    console.log(`Color used: ${colorName}`);

    highlightSelection(color);
    showToast("Saved with highlight!");
    removeElements();
    });


    wrapper.appendChild(colorBtn);
  });

  document.body.appendChild(wrapper);
}

function highlightSelection(color) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Extract the selected content
  const extractedContent = range.extractContents();

  // Create a span and wrap the extracted content
  const span = document.createElement("span");
  span.style.backgroundColor = color;
  span.style.borderRadius = "3px";
  span.style.padding = "0 2px";
  span.style.color = "#000";
  span.appendChild(extractedContent);

  // Insert the span in place of the extracted content
  range.insertNode(span);

  // Clear selection (optional, for UX)
  selection.removeAllRanges();
}


function removeElements() {
  const btn = document.getElementById("web2sheet-save-btn");
  if (btn) btn.remove();
  removeColorPicker();
}

function removeColorPicker() {
  const picker = document.getElementById("web2sheet-color-picker");
  if (picker) picker.remove();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 18px";
  toast.style.background = "#323232";
  toast.style.color = "#fff";
  toast.style.fontSize = "14px";
  toast.style.borderRadius = "6px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  toast.style.zIndex = "10000";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

console.log("✅ Web-to-Sheet Content Script loaded");
