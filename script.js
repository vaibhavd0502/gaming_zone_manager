const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby4H7UJDVnNBKdjIiA8qumtP8qkHFmlj3SIHLTnkFFrBEPlljoFzqew4E3HxrRTXw3k/exec";
let activeSessions = {};

function toggleStation(id) {
    const btn = document.getElementById(`btn-${id}`);
    if (!activeSessions[id]) {
        // Start Session
        activeSessions[id] = {
            startTime: Date.now(),
            rate: parseInt(document.getElementById(`ctrl-${id}`).value),
            interval: setInterval(() => updateUI(id), 1000)
        };
        btn.innerText = "Stop & Save";
        btn.style.backgroundColor = "#ff4d4d";
    } else {
        // Stop Session
        stopSession(id);
    }
}

function updateUI(id) {
    const session = activeSessions[id];
    const elapsedSecs = Math.floor((Date.now() - session.startTime) / 1000);
    
    const h = String(Math.floor(elapsedSecs / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsedSecs % 3600) / 60)).padStart(2, '0');
    const s = String(elapsedSecs % 60).padStart(2, '0');
    
    document.getElementById(`timer-${id}`).innerText = `${h}:${m}:${s}`;
    const cost = (elapsedSecs / 3600) * session.rate;
    document.getElementById(`bill-${id}`).innerText = `₹${cost.toFixed(2)}`;
}

async function stopSession(id) {
    const session = activeSessions[id];
    clearInterval(session.interval);
    
    const finalData = {
        Station: `Station ${id}`,
        Controllers: document.getElementById(`ctrl-${id}`).selectedOptions[0].text,
        Duration: document.getElementById(`timer-${id}`).innerText,
        Total_Bill: document.getElementById(`bill-${id}`).innerText.replace('₹', '')
    };

    // Reset UI
    document.getElementById(`btn-${id}`).innerText = "Saving...";
    
    // Send to Google Sheets
    await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(finalData)
    });

    alert(`Session Saved! Collect ₹${finalData.Total_Bill}`);
    
    delete activeSessions[id];
    document.getElementById(`btn-${id}`).innerText = "Start Session";
    document.getElementById(`btn-${id}`).style.backgroundColor = "#4CAF50";
    document.getElementById(`timer-${id}`).innerText = "00:00:00";
    document.getElementById(`bill-${id}`).innerText = "₹0.00";
}
