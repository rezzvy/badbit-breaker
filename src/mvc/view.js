export default class View {
  constructor() {
    // Initialize Bootstrap modals
    this.stopModal = new bootstrap.Modal("#stop-modal");
    this.startAtSpesificTimeModal = new bootstrap.Modal("#start-at-spesific-time-modal");
    this.historyDetailModal = new bootstrap.Modal("#history-detail-modal");

    this.els = {};
  }

  // Helper method to select an element
  el(target) {
    if (typeof target !== "string") return target;

    if (!(target in this.els)) {
      this.els[target] = document.querySelector(target);
    }

    return this.els[target];
  }

  // Add event listener to a target element
  on(target, eventName, handler) {
    this.el(target)?.addEventListener(eventName, handler);
  }

  // Enable or disable an element by toggling CSS classes
  disable(target, boolean) {
    const el = this.el(target);
    el.classList.toggle("opacity-50", boolean);
    el.classList.toggle("pe-none", boolean);
  }

  // Updates UI state when the counter starts or stops
  start(isRunning) {
    const button = this.el("#start-counter");

    if (isRunning) {
      button.textContent = "Stop";
      button.classList.replace("btn-primary", "btn-danger");
      this.disable("#start-button-alternative", true);
    } else {
      button.textContent = "Start";
      button.classList.replace("btn-danger", "btn-primary");
      this.disable("#start-button-alternative", false);

      this.setTimer();
    }
  }

  // Updates the displayed timer values
  setTimer(data = [], isMain = true) {
    const [currentTime = "0", currentUnit = "sec", years = "0", months = "0", days = "0", hours = "0", minutes = "0", seconds = "0"] = data;

    const prefix = isMain ? "#date-output-main" : "#date-output-history";

    this.el(`${prefix} ${isMain ? "._main-time" : ".history-current-time"}`).textContent = currentTime;
    this.el(`${prefix} ${isMain ? "._main-unit" : ".history-current-unit"}`).textContent = currentUnit;
    this.el(`${prefix} .years`).textContent = years;
    this.el(`${prefix} .months`).textContent = months;
    this.el(`${prefix} .days`).textContent = days;
    this.el(`${prefix} .hours`).textContent = hours;
    this.el(`${prefix} .minutes`).textContent = minutes;
    this.el(`${prefix} .seconds`).textContent = seconds;
  }

  // Triggers a file download
  download(fileName, objURL) {
    const a = document.createElement("a");
    a.download = fileName;
    a.href = objURL;
    a.click();
    URL.revokeObjectURL(objURL);
  }

  // Generates a history item element
  generateHistoryItem(streak, startTime, endTime) {
    return `
      <div class="history-item p-3 border d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 class="h6 mb-0">
            ${streak} <span class="badge text-bg-dark">streak</span>
          </h3>
          <p class="mb-0">Ended at ${new Date(endTime)}</p>
        </div>
        <div>
          <button 
            class="btn btn-warning fw-bold history-detail-btn" 
            data-bs-toggle="tooltip" 
            data-bs-title="Detail" 
            data-start-time="${startTime}"
          >
            <i class="fa fa-info-circle fa-fw"></i>
          </button>
          <button 
            class="btn btn-danger fw-bold history-remove-btn" 
            data-bs-toggle="tooltip" 
            data-bs-title="Remove"
            data-start-time="${startTime}"
          >
            <i class="fa fa-trash fa-fw"></i>
          </button>
        </div>
      </div>
    `;
  }
}
