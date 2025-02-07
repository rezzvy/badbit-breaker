new bootstrap.Tooltip(document.body, {
  selector: '[data-bs-toggle="tooltip"]',
  trigger: "hover",
});

const stopModal = new bootstrap.Modal("#stop-modal");
const startAtSpesificTimeModal = new bootstrap.Modal("#start-at-spesific-time-modal");
const historyDetailModal = new bootstrap.Modal("#history-detail-modal");

const startCounterButton = document.getElementById("start-counter");
const startCounterButtonAtSpesificTime = document.getElementById("start-at-spesific-time-button");
const startCounterButtonAlternative = document.getElementById("start-button-alternative");

const historyWrapper = document.getElementById("history-wrapper");

const stopCounterButton = document.getElementById("stop-modal-button");
const stopCounterTextareaInput = document.getElementById("stop-reason-textarea-input");

const datetimeInput = document.getElementById("datetime-input");
const alertInvalidDate = document.getElementById("alert-invalid-date");

const mainTimeOutput = document.querySelector("#date-output-main ._main-time");
const mainUnitOutput = document.querySelector("#date-output-main ._main-unit");

const mainYearsOutput = document.querySelector("#date-output-main .years");
const mainMontshOutput = document.querySelector("#date-output-main .months");
const mainDaysOutput = document.querySelector("#date-output-main .days");
const mainHoursOutput = document.querySelector("#date-output-main .hours");
const mainMinutesOutput = document.querySelector("#date-output-main .minutes");
const mainSecondsOutput = document.querySelector("#date-output-main .seconds");

const historyTimeOutput = document.querySelector("#date-output-history .history-current-time");
const historyUnitOutput = document.querySelector("#date-output-history .history-current-unit");

const historyYearsOutput = document.querySelector("#date-output-history .years");
const historyMontshOutput = document.querySelector("#date-output-history .months");
const historyDaysOutput = document.querySelector("#date-output-history .days");
const historyHoursOutput = document.querySelector("#date-output-history .hours");
const historyMinutesOutput = document.querySelector("#date-output-history .minutes");
const historySecondsOutput = document.querySelector("#date-output-history .seconds");

const historyStartTimeElement = document.getElementById("history-start-time");
const historyEndTimeElement = document.getElementById("history-end-time");
const historyReasonElement = document.getElementById("history-reason");

let interval = "";

function _calculateTime(time) {
  const currentMoment = TickAgo.moment(time, {
    labels: { sec: "@sec", minutes: "@minutes", hours: "@hours", days: "@days", months: "@months", years: "@years" },
  });
  const [currentTime, currentUnit] = currentMoment.split("@");
  const { years, months, days, hours, minutes, seconds } = TickAgo.compare(time, Date.now());

  return [currentTime, currentUnit, years, months, days, hours, minutes, seconds];
}

function renderTime(boolean, time, init = false) {
  clearInterval(interval);

  if (init) setOutputDate(_calculateTime(time));

  if (boolean) {
    interval = setInterval(() => {
      setOutputDate(_calculateTime(time));
    }, 1000);

    return;
  }

  resetOutputDate();
  interval = "";
}

function generateHistoryItem(streak, startTime, endTime) {
  return `
            <div class="history-item p-3 border d-flex justify-content-between align-items-center flex-wrap">
                <div>
                  <h3 class="h6 mb-0">${streak} <span class="badge text-bg-dark">streak</span></h3>
                  <p class="mb-0">Ended at ${new Date(endTime)}</p>
                </div>
                <div>
                  <button class="btn btn-warning fw-bold history-detail-btn" data-bs-toggle="tooltip" data-bs-title="Detail" data-start-time="${startTime}">
                    <i class="fa fa-info-circle fa-fw"></i>
                  </button>
                  <button class="btn btn-danger fw-bold history-remove-btn" data-bs-toggle="tooltip" data-bs-title="Remove"><i class="fa fa-trash fa-fw"></i></button>
                </div>
              </div>
    `;
}

function setOutputDate(data) {
  const [currentTime, currentUnit, years, months, days, hours, minutes, seconds] = data;

  mainTimeOutput.textContent = currentTime;
  mainUnitOutput.textContent = currentUnit;

  mainYearsOutput.textContent = years;
  mainMontshOutput.textContent = months;
  mainDaysOutput.textContent = days;
  mainHoursOutput.textContent = hours;
  mainMinutesOutput.textContent = minutes;
  mainSecondsOutput.textContent = seconds;
}

function resetOutputDate() {
  mainTimeOutput.textContent = "0";
  mainUnitOutput.textContent = "sec";

  mainYearsOutput.textContent = "0";
  mainMontshOutput.textContent = "0";
  mainDaysOutput.textContent = "0";
  mainHoursOutput.textContent = "0";
  mainMinutesOutput.textContent = "0";
  mainSecondsOutput.textContent = "0";
}

let isRunning = false;

function _start(time, init = false) {
  isRunning = true;
  startCounterButton.textContent = "Stop";
  startCounterButton.classList.replace("btn-primary", "btn-danger");
  startCounterButtonAlternative.classList.add("opacity-50", "pe-none");

  localStorage.setItem("bbk_currentTime", time);
  localStorage.setItem("bbk_status", "running");

  renderTime(true, time, init);
}

let history = [];

function _stop() {
  isRunning = false;
  startCounterButton.textContent = "Start";
  startCounterButton.classList.replace("btn-danger", "btn-primary");
  startCounterButtonAlternative.classList.remove("opacity-50", "pe-none");

  history.push({
    moment: TickAgo.moment(parseInt(localStorage.getItem("bbk_currentTime"))).split(" ago")[0],
    startTime: parseInt(localStorage.getItem("bbk_currentTime")),
    endTime: Date.now(),
    reason: stopCounterTextareaInput.value,
  });

  const latest = history[history.length - 1];

  localStorage.setItem("bbk_currentTime", 0);
  localStorage.setItem("bbk_status", "not_running");
  localStorage.setItem("bbk_history", JSON.stringify(history));

  historyWrapper.innerHTML += generateHistoryItem(latest.moment, latest.startTime, latest.endTime, latest.reason);

  renderTime(false);
}

startCounterButton.addEventListener("click", (e) => {
  if (!isRunning) {
    _start(Date.now());
  } else {
    stopModal.show();
  }
});

stopCounterButton.addEventListener("click", (e) => {
  _stop();
  stopCounterTextareaInput.value = "";
  stopModal.hide();
});

datetimeInput.addEventListener("input", (e) => {
  const inputTime = new Date(e.target.value).getTime();
  const currentTime = Date.now();

  if (inputTime > currentTime) {
    alertInvalidDate.classList.remove("d-none");
    startCounterButtonAtSpesificTime.classList.add("opacity-50", "pe-none");
    e.target.value = "";
  } else {
    alertInvalidDate.classList.add("d-none");
    startCounterButtonAtSpesificTime.classList.remove("opacity-50", "pe-none");
  }

  e.target.blur();
});

startAtSpesificTimeModal._element.addEventListener("hide.bs.modal", (e) => {
  alertInvalidDate.classList.add("d-none");
  startCounterButtonAtSpesificTime.classList.remove("opacity-50", "pe-none");
});

startCounterButtonAtSpesificTime.addEventListener("click", (e) => {
  _start(new Date(datetimeInput.value).getTime(), true);
  datetimeInput.value = "";

  startAtSpesificTimeModal.hide();
});

document.addEventListener("DOMContentLoaded", (e) => {
  const historyData = localStorage.getItem("bbk_history");

  if (historyData) {
    const data = JSON.parse(historyData);

    for (const item of data) {
      const { moment, startTime, endTime, reason } = item;
      history.push(item);

      historyWrapper.innerHTML += generateHistoryItem(moment, startTime, endTime, reason);
    }
  }

  const status = localStorage.getItem("bbk_status");
  const time = parseInt(localStorage.getItem("bbk_currentTime"));
  if (status !== "running" || time === 0) return;

  _start(time, true);
});

historyWrapper.addEventListener("click", (e) => {
  const btn = e.target;

  if (btn.matches(".history-remove-btn")) {
    const startTime = parseInt(btn.previousElementSibling.dataset.startTime);

    const index = history.findIndex((item) => item.startTime === startTime);
    if (index !== -1) {
      history.splice(index, 1);
      localStorage.setItem("bbk_history", JSON.stringify(history));

      bootstrap.Tooltip.getInstance(btn)?.dispose();
      btn.closest(".history-item")?.remove();
    }
  }

  if (btn.matches(".history-detail-btn")) {
    const index = history.findIndex((item) => item.startTime === parseInt(btn.dataset.startTime));
    const data = history[index];

    console.log(data);
    const { years, months, days, hours, minutes, seconds } = TickAgo.compare(data.startTime, data.endTime);

    const [currentTime, currentUnit] = data.moment.split(" ");

    historyTimeOutput.textContent = currentTime;
    historyUnitOutput.textContent = currentUnit;

    historyYearsOutput.textContent = years;
    historyMontshOutput.textContent = months;
    historyDaysOutput.textContent = days;
    historyHoursOutput.textContent = hours;
    historyMinutesOutput.textContent = minutes;
    historySecondsOutput.textContent = seconds;

    historyStartTimeElement.textContent = new Date(parseInt(data.startTime));
    historyEndTimeElement.textContent = new Date(parseInt(data.endTime));
    historyReasonElement.textContent = data.reason.trim();

    historyDetailModal.show();
  }
});
