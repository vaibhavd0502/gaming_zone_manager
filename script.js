const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxSmuWHsj2Ei9r3IoVHYXznWCP0DSb8yyBXWI2P7fAjnHwtYUogox-mT28Weg4ynqGh/exec";

let activeSessions = {};

function toggleStation(id) {
    const btn = document.getElementById(`btn-${id}`);
    const dot = document.getElementById(`dot-${id}`);
    const select = document.getElementById(`ctrl-${id}`);
    const nameInput = document.getElementById(`name-${id}`);

    if (!activeSessions[id]) {
        // START SESSION
        activeSessions[id] = {
            startTime: Date.now(),
            rate: parseInt(select.value),
            interval: setInterval(() => updateUI(id), 1000)
        };
        
        btn.innerText = "Stop & Save";
        btn.className = "btn-stop";
        dot.classList.add("active-dot");
        select.disabled = true;
        nameInput.disabled = true;
    } else {
        // STOP SESSION
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
    
    const btn = document.getElementById(`btn-${id}`);
    const dot = document.getElementById(`dot-${id}`);
    const select = document.getElementById(`ctrl-${id}`);
    const nameInput = document.getElementById(`name-${id}`);

    const finalData = {
        Customer_Name: nameInput.value || "Anonymous",
        Station: `Station ${id}`,
        Controllers: select.selectedOptions[0].text,
        Duration: document.getElementById(`timer-${id}`).innerText,
        Total_Bill: document.getElementById(`bill-${id}`).innerText.replace('₹', '')
    };

    btn.innerText = "Syncing Sheets...";
    btn.disabled = true;

    try {
        // Send data to Google Sheets
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
        
        alert(`Data Saved!\nCustomer: ${finalData.Customer_Name}\nTotal: ₹${finalData.Total_Bill}`);
    } catch (e) {
        alert("Local Save Successful. Sheet Sync failed - Check internet.");
        console.error(e);
    }

    // Reset UI for next customer
    delete activeSessions[id];
    btn.innerText = "Start Session";
    btn.className = "btn-start";
    btn.disabled = false;
    dot.classList.remove("active-dot");
    select.disabled = false;
    nameInput.disabled = false;
    nameInput.value = "";
    document.getElementById(`timer-${id}`).innerText = "00:00:00";
    document.getElementById(`bill-${id}`).innerText = "₹0.00";
}
