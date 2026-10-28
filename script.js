// Get saved records from browser
let milkRecords = JSON.parse(
    localStorage.getItem("dairyMilkRecords") || "[]"
);
const milkForm = document.getElementById("milkForm");
const milkTable = document.getElementById("milkTable");
// Set today's date
document.getElementById("milkDate").value =
    new Date().toISOString().split("T")[0];
// Add milk record
milkForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const date = document.getElementById("milkDate").value;
    const customerName = document.getElementById("customerName").value.trim();
    const type = document.getElementById("milkType").value;
    const quantity = Number(
        document.getElementById("milkQuantity").value
    );
    const rate = Number(
        document.getElementById("milkRate").value
    );
    if (!date || quantity <= 0 || rate < 0 ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(rate)) {
        alert("Please enter valid milk details.");
        return;
    }
    const record = {
    id: Date.now(),
    date: date,
    customerName: customerName,
    type: type,
    quantity: quantity,
    rate: rate,
    amount: quantity * rate
};

    milkRecords.push(record);
    saveRecords();
    renderDashboard();
    renderTable();
    renderChart();
    milkForm.reset();
    document.getElementById("milkDate").value = date;
    document.getElementById("milkRate").value = 43;
    alert("Milk record added successfully!");
});
// Save records in browser
function saveRecords() {
    localStorage.setItem(
        "dairyMilkRecords",
        JSON.stringify(milkRecords)
    );
}
// Render dashboard
function renderDashboard() {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = milkRecords.filter(
        record => record.date === today
    );
    const totalMilk = todayRecords.reduce(
        (sum, record) => sum + record.quantity,
        0
    );
    const totalSales = todayRecords.reduce(
        (sum, record) => sum + record.amount,
        0
    );
    document.getElementById("totalMilk").textContent =
        totalMilk.toFixed(1) + " Litres";
    document.getElementById("totalSales").textContent =
        "₹" + totalSales.toFixed(2);
    // Customer and expense modules will be added later
}
// Render milk table
function renderTable() {
    milkTable.innerHTML = "";
    milkRecords.slice().reverse().forEach(record => {
        const row = document.createElement("tr");
        const values = [
            record.date,
            record.customerName || "—",
            record.type,
            record.quantity + " L",
            "₹" + record.rate.toFixed(2),
            "₹" + record.amount.toFixed(2)
        ];
        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", function () {
            if (confirm("Delete this milk record?")) {
                milkRecords = milkRecords.filter(
                    item => item.id !== record.id
                );
                saveRecords();
                renderDashboard();
                renderTable();
                renderChart();
            }
        });
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        milkTable.appendChild(row);
    });
}
// Create production chart
let milkChart;
function renderChart() {
    const chartElement = document.getElementById("milkChart");
    if (!chartElement || typeof Chart === "undefined") {
        return;
    }
    const totals = {};
    milkRecords.forEach(record => {
        totals[record.date] =
            (totals[record.date] || 0) + record.quantity;});
             const dates = Object.keys(totals).sort().slice(-7);
    const quantities = dates.map(date => totals[date]);
    if (milkChart) {
        milkChart.destroy();
    }
    milkChart = new Chart(chartElement, {
        type: "bar",
        data: {
            labels: dates,
            datasets: [{
                label: "Milk Production (Litres)",
                data: quantities,
                backgroundColor: "#47a886",
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
// Load saved data when website opens
renderDashboard();
renderTable();
renderChart();