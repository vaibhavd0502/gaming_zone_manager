// REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
const SCRIPT_URL = "YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE";

let activeSessions = {};

function toggleStation(id) {
    const btn = document.getElementById(`btn-${id}`);
    const dot = document.getElementById(`dot-${id}`);
    const select = document.getElementById(`ctrl-${id}`);

    if (!activeSessions[id]) {
        activeSessions[id] = {
            startTime: Date.now(),
            rate: parseInt(select.value),
            interval: setInterval(() => updateUI(id), 1000)
        };
        btn.innerText = "Stop & Save";
        btn.className = "btn-stop";
        dot.classList.add("active-dot");
        select.disabled = true;
    } else {
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

    const finalData = {
        Station: `Station ${id}`,
        Controllers: select.selectedOptions[0].text,
        Duration: document.getElementById(`timer-${id}`).innerText,
        Total_Bill: document.getElementById(`bill-${id}`).innerText.replace('₹', '')
    };

    btn.innerText = "Saving to Sheets...";
    btn.disabled = true;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(finalData)
        });
        alert(`Session Complete!\nStation: ${id}\nTotal: ₹${finalData.Total_Bill}`);
    } catch (e) {
        alert("Failed to reach Google Sheets. Check connection.");
    }

    delete activeSessions[id];
    btn.innerText = "Start Session";
    btn.className = "btn-start";
    btn.disabled = false;
    dot.classList.remove("active-dot");
    select.disabled = false;
    document.getElementById(`timer-${id}`).innerText = "00:00:00";
    document.getElementById(`bill-${id}`).innerText = "₹0.00";
}
