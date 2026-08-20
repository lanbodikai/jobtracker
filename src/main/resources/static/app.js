const STATUS_ORDER = ["INTERESTED", "APPLIED", "OA", "INTERVIEWED", "FINAL_INTERVIEWED", "OFFER", "REJECTED"];
const INTERVIEW_STATUSES = new Set(["INTERVIEWED", "FINAL_INTERVIEWED"]);

const elements = {
  total: document.querySelector("#total-count"),
  active: document.querySelector("#active-count"),
  interviews: document.querySelector("#interview-count"),
  offers: document.querySelector("#offer-count"),
  pipelineTotal: document.querySelector("#pipeline-total"),
  statusList: document.querySelector("#status-list"),
  activityChart: document.querySelector("#activity-chart"),
  table: document.querySelector("#applications-table"),
  notice: document.querySelector("#notice"),
  updated: document.querySelector("#last-updated"),
  refresh: document.querySelector("#refresh-button")
};

function displayStatus(status) {
  return String(status || "UNKNOWN").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = safeDate(value);
  return date ? date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function renderMetrics(applications) {
  const total = applications.length;
  const interviews = applications.filter((application) => INTERVIEW_STATUSES.has(application.status)).length;
  const offers = applications.filter((application) => application.status === "OFFER").length;
  const active = applications.filter((application) => !["REJECTED", "OFFER"].includes(application.status)).length;
  elements.total.textContent = total;
  elements.active.textContent = active;
  elements.interviews.textContent = interviews;
  elements.offers.textContent = offers;
  elements.pipelineTotal.textContent = `${total} total`;
}

function renderStatusList(applications) {
  const counts = applications.reduce((result, application) => {
    const status = application.status || "UNKNOWN";
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});
  const statuses = [...STATUS_ORDER, ...Object.keys(counts).filter((status) => !STATUS_ORDER.includes(status))];
  if (!applications.length) {
    elements.statusList.innerHTML = '<p class="empty-state">No applications yet.</p>';
    return;
  }
  elements.statusList.innerHTML = statuses.filter((status) => counts[status]).map((status) => {
    const count = counts[status];
    const percentage = Math.round((count / applications.length) * 100);
    return `<div class="status-row"><div class="status-label"><span>${escapeHtml(displayStatus(status))}</span><span>${count} · ${percentage}%</span></div><div class="status-track"><div class="status-fill" data-status="${escapeHtml(status)}" style="width: ${percentage}%"></div></div></div>`;
  }).join("");
}

function renderActivity(applications) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const end = new Date(today);
    end.setDate(today.getDate() - (7 - index) * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { start, end, count: 0 };
  });
  applications.forEach((application) => {
    const date = safeDate(application.dateApplied);
    if (!date) return;
    const week = weeks.find(({ start, end }) => date >= start && date <= end);
    if (week) week.count += 1;
  });
  const max = Math.max(...weeks.map((week) => week.count), 1);
  elements.activityChart.innerHTML = weeks.map((week) => {
    const label = week.start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const height = Math.max(5, Math.round((week.count / max) * 125));
    return `<div class="activity-column"><span class="activity-value">${week.count}</span><div class="activity-bar" style="height: ${height}px" title="${week.count} application${week.count === 1 ? "" : "s"}"></div><span class="activity-label">${label}</span></div>`;
  }).join("");
}

function renderTable(applications) {
  const recent = [...applications].sort((first, second) => (safeDate(second.dateApplied) || 0) - (safeDate(first.dateApplied) || 0)).slice(0, 10);
  if (!recent.length) {
    elements.table.innerHTML = '<tr><td colspan="5" class="empty-state">No applications yet.</td></tr>';
    return;
  }
  elements.table.innerHTML = recent.map((application) => {
    const status = application.status || "UNKNOWN";
    const company = application.jobUrl ? `<a href="${escapeHtml(application.jobUrl)}" target="_blank" rel="noreferrer">${escapeHtml(application.company || "Untitled")}</a>` : escapeHtml(application.company || "Untitled");
    return `<tr><td>${company}</td><td>${escapeHtml(application.jobTitle || "—")}</td><td><span class="status-pill" data-status="${escapeHtml(status)}">${escapeHtml(displayStatus(status))}</span></td><td>${formatDate(application.dateApplied)}</td><td>${escapeHtml(application.location || "—")}</td></tr>`;
  }).join("");
}

async function loadApplications() {
  elements.refresh.disabled = true;
  elements.notice.textContent = "";
  try {
    const response = await fetch("/api/applications", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`The applications endpoint returned ${response.status}.`);
    const applications = await response.json();
    renderMetrics(applications);
    renderStatusList(applications);
    renderActivity(applications);
    renderTable(applications);
    elements.updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  } catch (error) {
    elements.notice.textContent = `Could not load applications. ${error.message}`;
    elements.statusList.innerHTML = '<p class="empty-state">Connect the API to see your pipeline.</p>';
    elements.activityChart.innerHTML = '<p class="empty-state">No activity available.</p>';
    elements.table.innerHTML = '<tr><td colspan="5" class="empty-state">No application data available.</td></tr>';
  } finally {
    elements.refresh.disabled = false;
  }
}

elements.refresh.addEventListener("click", loadApplications);
loadApplications();
