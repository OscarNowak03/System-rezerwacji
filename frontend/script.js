const API = "http://localhost:3000";

let calendar;
let resourcesChart;
let companiesChart;

/* ================= STATE ================= */
let selectedMonth = null;

/* ================= KOLOR FIRMY ================= */
function getColor(name) {
    if (!name) return "#999";

    let hash = 0;

    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    hash = Math.abs(hash);

    const hue = (hash * 37) % 360;

    return `hsl(${hue}, 70%, 55%)`;
}

/* ================= FORMAT DATY ================= */
function formatDateTimeLocal(date) {
    const pad = (n) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/* ================= MIESIĄCE ================= */
function initMonthFilter(reservations) {
    const select = document.getElementById("monthFilter");

    const months = new Set();

    reservations.forEach(r => {
        const d = new Date(r.start_time);

        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

        months.add(key);
    });

    const sorted = [...months].sort().reverse();

    select.innerHTML = "";

    sorted.forEach(m => {
        const option = document.createElement("option");

        option.value = m;
        option.textContent = m;

        select.appendChild(option);
    });

    const now = new Date();

    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    selectedMonth = current;

    select.value = current;
}

/* ================= KALENDARZ ================= */
function initCalendar() {
    const el = document.getElementById("calendar");

    calendar = new FullCalendar.Calendar(el, {
        locale: "pl",
        firstDay: 1,
        editable: true,
        allDaySlot: false,
        slotMinTime: "06:00:00",
        slotMaxTime: "22:00:00",
        initialView: "dayGridMonth",

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },

        buttonText: {
            today: "bieżący",
            month: "miesiąc",
            week: "tydzień"
        },

        eventClick: function (info) {
            if (confirm("Usunąć rezerwację?")) {
                deleteReservation(info.event.id);
            }
        },

        dateClick: function (info) {
            const start = new Date(info.date);
            const end = new Date(start);
            end.setHours(end.getHours() + 1);

            document.getElementById("start").value = formatDateTimeLocal(start);
            document.getElementById("end").value = formatDateTimeLocal(end);
        },

        eventDrop: async function (info) {
            const res = await fetch(`${API}/reservations/${info.event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    start_time: info.event.start,
                    end_time: info.event.end
                })
            });

            if (!res.ok) {
                alert("Błąd aktualizacji");
                info.revert();
            } else {
                loadDashboard();
            }
        }
    });

    calendar.render();
}

/* ================= REZERWACJE ================= */
async function loadReservations() {
    const res = await fetch(`${API}/reservations`);
    const data = await res.json();

    calendar.removeAllEvents();

    data.forEach(r => {
        const color = getColor(r.company_name);

        calendar.addEvent({
            id: r.id,
            title: `${r.company_name} (${r.resource_name})`,
            start: r.start_time,
            end: r.end_time,
            backgroundColor: color,
            borderColor: color
        });
    });
}

/* ================= FIRMY ================= */
async function loadCompanies() {
    const res = await fetch(`${API}/companies`);
    const data = await res.json();

    const list = document.getElementById("companiesList");
    const select = document.getElementById("companySelect");

    list.innerHTML = "";
    select.innerHTML = "";

    data.forEach(c => {
        const li = document.createElement("li");

        const del = document.createElement("span");
        del.textContent = "🗑";
        del.style.cursor = "pointer";
        del.onclick = () => deleteCompany(c.id);

        li.textContent = c.name + " ";
        li.appendChild(del);

        list.appendChild(li);

        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

/* ================= ZASOBY ================= */
async function loadResources() {
    const res = await fetch(`${API}/resources`);
    const data = await res.json();

    const list = document.getElementById("resourcesList");
    const select = document.getElementById("resourceSelect");

    list.innerHTML = "";
    select.innerHTML = "";

    data.forEach(r => {
        const li = document.createElement("li");

        const del = document.createElement("span");
        del.textContent = "🗑";
        del.style.cursor = "pointer";
        del.onclick = () => deleteResource(r.id);

        li.textContent = r.name + " ";
        li.appendChild(del);

        list.appendChild(li);

        const option = document.createElement("option");
        option.value = r.id;
        option.textContent = r.name;
        select.appendChild(option);
    });
}

/* ================= DASHBOARD ================= */
async function loadDashboard() {
    const [resR, resC, resS] = await Promise.all([
        fetch(`${API}/reservations`),
        fetch(`${API}/companies`),
        fetch(`${API}/resources`)
    ]);

    const reservations = await resR.json();

    if (!document.getElementById("monthFilter").options.length) {
        initMonthFilter(reservations);
    }

    const selected = document.getElementById("monthFilter").value;

    const monthReservations = reservations.filter(r => {
        const d = new Date(r.start_time);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return key === selected;
    });

    /* KPI (PO ID, NIE PO NAZWIE) */
    document.getElementById("statReservations").innerText = monthReservations.length;

    document.getElementById("statCompanies").innerText =
        new Set(monthReservations.map(r => r.company_id)).size;

    document.getElementById("statResources").innerText =
        new Set(monthReservations.map(r => r.resource_id)).size;

    /* STATS */
    const resourceStats = {};
    const companyStats = {};

    monthReservations.forEach(r => {
        resourceStats[r.resource_name] =
            (resourceStats[r.resource_name] || 0) + 1;

        const hours =
            (new Date(r.end_time) - new Date(r.start_time)) / (1000 * 60 * 60);

        companyStats[r.company_name] =
            (companyStats[r.company_name] || 0) + hours;
    });

    if (resourcesChart) resourcesChart.destroy();

    resourcesChart = new Chart(
        document.getElementById("resourcesChart"),
        {
            type: "bar",
            data: {
                labels: Object.keys(resourceStats),
                datasets: [{
                    label: "Rezerwacje",
                    data: Object.values(resourceStats)
                }]
            }
        }
    );

    if (companiesChart) companiesChart.destroy();

    companiesChart = new Chart(
        document.getElementById("companiesChart"),
        {
            type: "pie",
            data: {
                labels: Object.keys(companyStats),
                datasets: [{
                    data: Object.values(companyStats).map(v => Number(v.toFixed(1)))
                }]
            }
        }
    );
}

/* ================= ADD ================= */
async function addCompany() {
    const name = document.getElementById("companyName").value;
    if (!name) return;

    await fetch(`${API}/companies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    document.getElementById("companyName").value = "";

    loadCompanies();
    loadDashboard();
}

async function addResource() {
    const name = document.getElementById("resourceName").value;
    if (!name) return;

    await fetch(`${API}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    });

    document.getElementById("resourceName").value = "";

    loadResources();
    loadDashboard();
}

async function addReservation() {
    const company_id = document.getElementById("companySelect").value;
    const resource_id = document.getElementById("resourceSelect").value;
    const start_time = document.getElementById("start").value;
    const end_time = document.getElementById("end").value;

    if (new Date(start_time) >= new Date(end_time)) {
        alert("Błędny zakres czasu");
        return;
    }

    const res = await fetch(`${API}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            company_id,
            resource_id,
            start_time,
            end_time
        })
    });

    alert(await res.text());

    loadReservations();
    loadDashboard();
}

/* ================= DELETE ================= */
async function deleteCompany(id) {
    await fetch(`${API}/companies/${id}`, { method: "DELETE" });
    loadCompanies();
    loadDashboard();
}

async function deleteResource(id) {
    await fetch(`${API}/resources/${id}`, { method: "DELETE" });
    loadResources();
    loadDashboard();
}

async function deleteReservation(id) {
    await fetch(`${API}/reservations/${id}`, { method: "DELETE" });
    loadReservations();
    loadDashboard();
}

/* ================= START ================= */
initCalendar();
loadCompanies();
loadResources();
loadReservations();
loadDashboard();

document.getElementById("monthFilter").addEventListener("change", loadDashboard);