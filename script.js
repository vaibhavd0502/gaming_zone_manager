let activeSessions = {};

function toggleStation(id) {
    const btn = document.getElementById(`btn-${id}`);
    const nameInput = document.getElementById(`name-${id}`);
    const select = document.getElementById(`ctrl-${id}`);

    if (!activeSessions[id]) {
        // --- START SESSION LOGIC ---
        const startTimeStr = new Date().toLocaleTimeString();
        const customer = nameInput.value || "Guest";
        const setup = select.selectedOptions[0].text;

        activeSessions[id] = {
            startTime: Date.now(),
            rate: parseInt(select.value),
            interval: setInterval(() => updateUI(id), 1000)
        };

        // Prepare WhatsApp Message
        const startMsg = `🎮 *Gamer's Paradise - SESSION START*%0A------------------------- %0A*Station:* ${id}%0A*Customer:* ${customer}%0A*Setup:* ${setup}%0A*Start Time:* ${startTimeStr}`;
        
        // Open WhatsApp to send to group
        window.open(`https://wa.me/?text=${startMsg}`, '_blank');

        // Update UI
        btn.innerText = "Stop & Save";
        btn.className = "btn-stop";
        select.disabled = true;
        nameInput.disabled = true;
    } else {
        // --- STOP SESSION LOGIC ---
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
    
    // Calculate current cost
    const cost = (elapsedSecs / 3600) * session.rate;
    document.getElementById(`bill-${id}`).innerText = `₹${cost.toFixed(2)}`;
}

function stopSession(id) {
    const session = activeSessions[id];
    clearInterval(session.interval);
    
    const customer = document.getElementById(`name-${id}`).value || "Guest";
    const duration = document.getElementById(`timer-${id}`).innerText;
    const total = document.getElementById(`bill-${id}`).innerText;

    // Prepare WhatsApp Message
    const endMsg = `🏁 *Gamer's Paradise - SESSION END*%0A------------------------- %0A*Station:* ${id}%0A*Customer:* ${customer}%0A*Duration:* ${duration}%0A*Total Bill:* ${total}%0A*Status:* Collected ✅`;

    // Open WhatsApp to send to group
    window.open(`https://wa.me/?text=${endMsg}`, '_blank');

    // Reset UI
    delete activeSessions[id];
    const btn = document.getElementById(`btn-${id}`);
    btn.innerText = "Start Session";
    btn.className = "btn-start";
    
    document.getElementById(`ctrl-${id}`).disabled = false;
    document.getElementById(`name-${id}`).disabled = false;
    document.getElementById(`name-${id}`).value = "";
    document.getElementById(`timer-${id}`).innerText = "00:00:00";
    document.getElementById(`bill-${id}`).innerText = "₹0.00";
}
