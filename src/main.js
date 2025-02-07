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

let interval = "";

function _calculateTime(time) {
  const currentMoment = TickAgo.moment(time, {
    labels: { sec: "@seconds", minutes: "@minutes", hours: "@hours", days: "@days", months: "@months", years: "@years" },
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
  mainUnitOutput.textContent = "seconds";

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

function _stop() {
  isRunning = false;
  startCounterButton.textContent = "Start";
  startCounterButton.classList.replace("btn-danger", "btn-primary");
  startCounterButtonAlternative.classList.remove("opacity-50", "pe-none");

  localStorage.setItem("bbk_currentTime", 0);
  localStorage.setItem("bbk_status", "not_running");

  renderTime(false);
}

startCounterButton.addEventListener("click", (e) => {
  if (!isRunning) {
    _start(Date.now());
  } else {
    _stop();
  }
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
  const status = localStorage.getItem("bbk_status");
  const time = parseInt(localStorage.getItem("bbk_currentTime"));
  if (status !== "running" || time === 0) return;

  _start(time, true);
});
