/* ============================================================
   Sustainable Waste Management in Smart Cities
   JavaScript Simulation Logic
   ------------------------------------------------------------
   All sensor values (ultrasonic, temperature, gas) and the
   camera classification are SIMULATED with JavaScript.
   No real hardware is used.
   ============================================================ */

/* =============================================================
   1. SAMPLE BIN DATA (fictional/sample readings)
   wasteLevel : percentage full (0 - 100)
   temperature: in degree Celsius
   gasLevel   : 0 - 100 (higher means more hazardous gas)
   wasteType  : result of the simulated camera classification
   ============================================================= */
let bins = [
    { id: "B01", location: "Kengeri",     wasteLevel: 45, temperature: 29, gasLevel: 25, wasteType: "Dry Waste" },
    { id: "B02", location: "RR Nagar",    wasteLevel: 87, temperature: 31, gasLevel: 45, wasteType: "Plastic" },
    { id: "B03", location: "Mysore Road", wasteLevel: 94, temperature: 38, gasLevel: 80, wasteType: "Wet Waste" },
    { id: "B04", location: "Vijayanagar", wasteLevel: 62, temperature: 27, gasLevel: 30, wasteType: "Metal" },
    { id: "B05", location: "Nagarbhavi",  wasteLevel: 38, temperature: 46, gasLevel: 35, wasteType: "Paper" },
    { id: "B06", location: "Rajajinagar", wasteLevel: 74, temperature: 33, gasLevel: 55, wasteType: "Mixed Waste" }
];

/* Keep an exact copy of the original data for the Reset button */
const originalBins = JSON.parse(JSON.stringify(bins));

/* Possible waste types produced by the simulated camera */
const wasteTypes = ["Wet Waste", "Dry Waste", "Plastic", "Metal", "Paper", "Mixed Waste"];

/* ------------------------------------------------------------------
   2. HELPER FUNCTION
   Returns a random integer between min and max (both included).
   ------------------------------------------------------------------ */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ------------------------------------------------------------------
   3. SIMULATED SENSORS
   ------------------------------------------------------------------ */

/* Simulate the ultrasonic sensor.
   It measures the distance (cm) between the top of the bin and the
   waste. Smaller distance means the bin is fuller.
   Simplified relation used: wasteLevel = 100 - distance */
function simulateUltrasonic() {
    const distance = randomBetween(5, 90);   // cm
    let level = 100 - distance;              // % full
    return level;
}

/* Simulate the temperature sensor (degree Celsius).
   A normal bin is around 24 C - 35 C, but we allow higher values
   so warnings/overheat alerts can appear. */
function simulateTemperature() {
    return randomBetween(24, 50);
}

/* Simulate the gas sensor.
   Returns a gas concentration between 0 and 100.
   0-40 Normal | 41-70 Moderate | 71-100 High */
function simulateGas() {
    return randomBetween(10, 95);
}

/* Simulate the camera.
   Returns a randomly chosen waste type. This is NOT a real camera,
   it simply picks a classification to simulate the AI camera. */
function simulateCamera() {
    const index = randomBetween(0, wasteTypes.length - 1);
    return wasteTypes[index];
}

/* Apply one new set of simulated readings to a single bin */
function updateBinSensors(bin) {
    bin.wasteLevel = simulateUltrasonic();
    bin.temperature = simulateTemperature();
    bin.gasLevel = simulateGas();
    bin.wasteType = simulateCamera();
}

/* ------------------------------------------------------------------
   4. ANALYSIS / DECISION LOGIC
   ------------------------------------------------------------------ */

/* Waste level status based on the percentage full */
function getWasteStatus(level) {
    if (level >= 90) return "Overflow Warning";
    if (level >= 80) return "Needs Collection";
    if (level >= 50) return "Moderate";
    return "Normal";
}

/* Temperature status string (used for information / display) */
function getTemperatureStatus(temp) {
    if (temp > 45) return "High Temperature Alert";
    if (temp >= 36) return "Warning";
    return "Normal";
}

/* Gas concentration status string */
function getGasStatus(gas) {
    if (gas >= 71) return "High";
    if (gas >= 41) return "Moderate";
    return "Normal";
}

/* True if the bin temperature is dangerous */
function isHighTemperature(temp) {
    return getTemperatureStatus(temp) === "High Temperature Alert";
}

/* True if the bin gas level is dangerous */
function isHighGas(gas) {
    return getGasStatus(gas) === "High";
}

/* Collection priority label for a bin */
function getPriority(level) {
    if (level >= 90) return "HIGH";
    if (level >= 80) return "MEDIUM";
    if (level >= 50) return "LOW";
    return "NONE";
}

/* ------------------------------------------------------------------
   5. RENDERING: DASHBOARD
   ------------------------------------------------------------------ */

/* Update the four summary cards at the top */
function renderSummary() {
    let normal = 0;
    let requireCollection = 0;
    let overflow = 0;

    for (const bin of bins) {
        if (getWasteStatus(bin.wasteLevel) === "Normal") normal++;
        else if (bin.wasteLevel >= 90) overflow++;
        else requireCollection++;
    }

    const cards = [
        { label: "Total Bins", value: bins.length, extra: "" },
        { label: "Normal Bins", value: normal, extra: "" },
        { label: "Bins Requiring Collection", value: requireCollection, extra: "warn" },
        { label: "Overflowing Bins", value: overflow, extra: "alert" }
    ];

    let html = "";
    for (const c of cards) {
        html += '<div class="summary-card ' + c.extra + '">';
        html += '<div class="value">' + c.value + '</div>';
        html += '<div class="label">' + c.label + '</div>';
        html += '</div>';
    }
    document.getElementById("summaryCards").innerHTML = html;
}

/* Update the bin monitoring table */
function renderTable() {
    let html = "";

    for (const bin of bins) {
        const status = getWasteStatus(bin.wasteLevel);
        const statusClass = getStatusClass(status);

        html += "<tr>";
        html += "<td>" + bin.id + "</td>";
        html += "<td>" + bin.location + "</td>";
        html += '<td>' + bin.wasteLevel + '%</td>';
        html += "<td>" + bin.temperature + " °C</td>";
        html += "<td>" + bin.gasLevel + " &middot; " + getGasStatus(bin.gasLevel) + "</td>";
        html += "<td>" + bin.wasteType + "</td>";
        html += "<td>";
        html += '<span class="status-badge ' + statusClass + '">' + status + "</span>";

        /* Extra warning tags for high gas / high temperature */
        if (isHighGas(bin.gasLevel)) {
            html += '<div><span class="warning-tag warning-gas">Gas Warning</span></div>';
        }
        if (isHighTemperature(bin.temperature)) {
            html += '<div><span class="warning-tag warning-temp">Temperature Warning</span></div>';
        }

        html += "</td>";
        html += "</tr>";
    }

    document.getElementById("binBody").innerHTML = html;
}

/* Helper: CSS class name for each waste status */
function getStatusClass(status) {
    if (status === "Normal") return "status-normal";
    if (status === "Moderate") return "status-moderate";
    if (status === "Needs Collection") return "status-collect";
    return "status-overflow";
}

/* Update the simple bar chart (Normal / Requiring / Overflowing) */
function renderChart() {
    let normal = 0;
    let requireCollection = 0;
    let overflow = 0;

    for (const bin of bins) {
        if (bin.wasteLevel >= 90) overflow++;
        else if (bin.wasteLevel >= 50) requireCollection++;
        else normal++;
    }

    const total = bins.length || 1;

    const rows = [
        { label: "Normal",      count: normal,             cls: "bar-green", color: "Green" },
        { label: "Requiring",   count: requireCollection,  cls: "bar-amber", color: "Amber" },
        { label: "Overflowing", count: overflow,           cls: "bar-red",   color: "Red" }
    ];

    let html = "";
    for (const r of rows) {
        const width = (r.count / total) * 100;
        html += '<div class="chart-row">';
        html += '<div class="chart-label">' + r.label + '</div>';
        html += '<div class="chart-track">';
        html += '<div class="chart-bar ' + r.cls + '" style="width: ' + width + '%">';
        html += r.count;
        html += "</div></div></div>";
    }

    html += '<div class="chart-legend">Green = Normal &middot; Amber = Requires Collection (50-89%) &middot; Red = Overflowing (>=90%)</div>';

    document.getElementById("statusChart").innerHTML = html;
}

/* Update the Active Alerts section */
function renderAlerts() {
    const alerts = [];

    for (const bin of bins) {
        if (bin.wasteLevel >= 90) {
            alerts.push(bin.id + " is " + bin.wasteLevel + "% full. Immediate collection required.");
        } else if (bin.wasteLevel >= 80) {
            alerts.push(bin.id + " (" + bin.location + ") requires waste collection.");
        }
        if (isHighGas(bin.gasLevel)) {
            alerts.push(bin.id + " has high gas level.");
        }
        if (isHighTemperature(bin.temperature)) {
            alerts.push(bin.id + " has high temperature.");
        }
    }

    let html = "";
    if (alerts.length === 0) {
        html = '<div class="no-alerts">No active alerts. All bins are operating normally.</div>';
    } else {
        for (const alert of alerts) {
            const urgent = alert.indexOf("Immediate") !== -1;
            html += '<div class="alert-item' + (urgent ? "" : " warn") + '">' + alert + "</div>";
        }
    }

    document.getElementById("alertsArea").innerHTML = html;
}

/* Update the Waste Collection Priority section */
function renderPriority() {
    /* Only bins at 50% or more need collection */
    const priorityBins = bins.filter(function (bin) {
        return getPriority(bin.wasteLevel) !== "NONE";
    });

    /* Sort from the highest waste level to the lowest (highest priority first) */
    priorityBins.sort(function (a, b) {
        return b.wasteLevel - a.wasteLevel;
    });

    let html = '<ul class="priority-list">';

    if (priorityBins.length === 0) {
        html += '<li class="no-alerts">No bins need collection right now.</li>';
    } else {
        for (let i = 0; i < priorityBins.length; i++) {
            const bin = priorityBins[i];
            const priority = getPriority(bin.wasteLevel);
            const cls = priority === "HIGH" ? "high" : (priority === "MEDIUM" ? "medium" : "low");

            html += '<li class="priority-item ' + cls + '">';
            html += '<span class="priority-rank">#' + (i + 1) + '</span>';
            html += "<strong>" + bin.id + "</strong>";
            html += "<span>" + bin.location + "</span>";
            html += "<span>" + bin.wasteLevel + "% full</span>";
            html += '<span class="tag tag-' + cls + '">' + priority + " PRIORITY</span>";
            html += "</li>";
        }
    }

    html += "</ul>";
    document.getElementById("priorityArea").innerHTML = html;
}

/* ------------------------------------------------------------------
   6. MAIN UPDATE FLOW
   ------------------------------------------------------------------ */

/* Generate new sensor readings and refresh the whole dashboard */
function simulateUpdate() {
    for (const bin of bins) {
        updateBinSensors(bin);
    }
    updateDashboard();
}

/* Re-render every part of the page */
function updateDashboard() {
    renderSummary();
    renderTable();
    renderChart();
    renderAlerts();
    renderPriority();

    /* Show the current time after every update */
    const now = new Date();
    document.getElementById("lastUpdated").textContent =
        "Last updated: " + now.toLocaleTimeString();
}

/* Restore the original sample readings */
function resetSimulation() {
    bins = JSON.parse(JSON.stringify(originalBins));
    updateDashboard();
}

/* ------------------------------------------------------------------
   7. AUTO SIMULATION (setInterval)
   ------------------------------------------------------------------ */
let autoTimer = null;
let autoRunning = false;

function toggleAutoSimulation() {
    const btn = document.getElementById("btnAuto");

    if (autoRunning) {
        clearInterval(autoTimer);
        autoTimer = null;
        autoRunning = false;
        btn.textContent = "Auto Simulation: OFF";
    } else {
        /* Simulate new sensor values every 3 seconds */
        autoTimer = setInterval(simulateUpdate, 3000);
        autoRunning = true;
        btn.textContent = "Auto Simulation: ON";
    }
}

/* ------------------------------------------------------------------
   8. BUTTON EVENTS
   ------------------------------------------------------------------ */
document.getElementById("btnSimulate").addEventListener("click", simulateUpdate);
document.getElementById("btnReset").addEventListener("click", resetSimulation);
document.getElementById("btnAuto").addEventListener("click", toggleAutoSimulation);

/* Draw the dashboard once when the page loads */
updateDashboard();