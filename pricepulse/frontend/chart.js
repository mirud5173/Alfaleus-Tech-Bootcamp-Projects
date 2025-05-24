let chartInstance = null;
let accumulatedHistory = [];
let startTrackingTime = null;

// Render chart with current accumulatedHistory
function renderChart(data) {
  const ctx = document.getElementById('priceChart').getContext('2d');

  const labels = data.map(entry => {
    const d = new Date(entry.timestamp);
    return d.toLocaleString();
  });

  const prices = data.map(entry => entry.price);

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = prices;
    chartInstance.update();
  } else {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price (₹)',
          data: prices,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1,
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: { display: true, text: 'Time' }
          },
          y: {
            display: true,
            title: { display: true, text: 'Price (₹)' },
            beginAtZero: false
          }
        }
      }
    });
  }
}

// Get new price every minute and append
async function updateChart(url) {
  if (!url || !startTrackingTime) return;

  try {
    const response = await fetch('/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url })
    });

    const data = await response.json();

    if (data.price) {
      const now = new Date();
      const numericPrice = parseFloat(data.price.replace(/[^\d.]/g, ''));
      accumulatedHistory.push({
        timestamp: now.toISOString(),
        price: numericPrice
      });
      console.log("✅ New price recorded:", numericPrice, "at", now.toLocaleString());
      renderChart(accumulatedHistory);
    } else {
      console.warn("⚠️ Price not found in update. Skipping.");
    }
  } catch (err) {
    console.error("❌ Failed to fetch updated price:", err);
  }
}
