const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const previewTable = document.getElementById('preview-table');
const tbody = previewTable.querySelector('tbody');

dropArea.addEventListener('click', () => fileElem.click());

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = 'blue';
});
dropArea.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#ccc';
});
dropArea.addEventListener('drop', (e) => {
  e.preventDefault();
  dropArea.style.borderColor = '#ccc';
  if (e.dataTransfer.files.length) {
    handleFiles(e.dataTransfer.files);
  }
});

fileElem.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFiles(e.target.files);
  }
});

function validateColumns(data) {
  if (data.length === 0) return false;
  const keys = Object.keys(data[0]);
  return ['Name', 'Number', 'Message'].every(k => keys.includes(k));
}

function handleFiles(files) {
  const file = files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!validateColumns(jsonData)) {
      alert("File is missing required columns: Name, Number, Message");
      return;
    }

    showPreview(jsonData);

    chrome.storage.local.set({ contactsData: jsonData }, () => {
      console.log("Contacts data saved:", jsonData);
    });
  };

  reader.readAsArrayBuffer(file);
}

function showPreview(data) {
  tbody.innerHTML = '';
  if (!data.length) {
    previewTable.style.display = 'none';
    return;
  }
  previewTable.style.display = 'table';

  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.Name || ''}</td>
      <td>${row.Number || ''}</td>
      <td>${row.Message || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Placeholder replacement example for later use:
function replacePlaceholders(message, data) {
  return message.replace(/{{\s*(\w+)\s*}}/g, (_, key) => data[key] || '');
}
