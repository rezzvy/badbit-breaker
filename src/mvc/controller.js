export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  // Initializes the controller and sets up event listeners
  init() {
    this.model.syncSession();
    this.renderSession();

    // Start or stop counter
    this.view.on("#start-counter", "click", () => {
      if (this.model.session.isRunning) {
        this.view.stopModal.show();
      } else {
        this.start(Date.now());
      }
    });

    // Stop counter and clear stop reason input
    this.view.on("#stop-modal-button", "click", () => {
      this.stop();
      this.view.el("#stop-reason-textarea-input").value = "";
      this.view.stopModal.hide();
    });

    // Validate datetime input
    this.view.on("#datetime-input", "input", (e) => {
      const inputTime = new Date(e.target.value).getTime();
      const currentTime = Date.now();

      this.view.disable("#start-at-spesific-time-button", inputTime > currentTime);
      this.view.el("#alert-invalid-date").classList.toggle("d-none", inputTime <= currentTime);

      e.target.blur();
    });

    // Start counter at a specific time
    this.view.on("#start-at-spesific-time-button", "click", () => {
      const time = new Date(this.view.el("#datetime-input").value).getTime();
      this.start(time, true);
      this.view.startAtSpesificTimeModal.hide();
    });

    // Reset datetime input on modal close
    this.view.on("#start-at-spesific-time-modal", "hide.bs.modal", () => {
      this.view.el("#datetime-input").value = "";
      this.view.el("#alert-invalid-date").classList.add("d-none");
    });

    // Handle history item clicks
    this.view.on("#history-wrapper", "click", (e) => {
      if (e.target.matches(".history-detail-btn")) {
        this.showHistoryDetail(e.target.dataset.startTime);
      } else if (e.target.matches(".history-remove-btn")) {
        this.model.deleteHistory(e.target.dataset.startTime);
        e.target.closest(".history-item").remove();
      }
    });

    // Load session file
    this.view.on("#load-btn", "click", () => {
      this.view.el("#load-file-input").click();
    });

    // Handle session file import
    this.view.on("#load-file-input", "change", (e) => {
      this.model.importSession(e.target.files[0], (data) => {
        if (!("time" in data && "history" in data && "isRunning" in data)) {
          return alert("Something went wrong!");
        }

        if (this.model.session.isRunning) this.stop();
        this.model.session = data;
        this.model.saveSession();
        this.renderSession();
      });
    });

    // Save session file
    this.view.on("#save-btn", "click", () => {
      this.view.download("bbk-save.json", this.model.exportSession());
    });
  }

  // Starts the timer
  start(time, initDisplay = false) {
    this.model.session.isRunning = true;
    this.model.session.time = time;
    this.model.saveSession();
    this.view.start(true);
    this.runTimer(time, initDisplay);
  }

  // Stops the timer and records history
  stop() {
    const { time } = this.model.session;

    this.model.session.history.push({
      moment: TickAgo.moment(time).replace(" ago", ""),
      startTime: time,
      endTime: Date.now(),
      reason: this.view.el("#stop-reason-textarea-input").value.trim(),
    });

    const { moment, startTime, endTime } = this.model.session.history.at(-1);
    this.view.el("#history-wrapper").innerHTML += this.view.generateHistoryItem(moment, startTime, endTime);

    this.model.reset();
    this.model.saveSession();
    this.view.start(false);
  }

  // Updates the timer display
  runTimer(time, initDisplay = false) {
    clearInterval(this.model.interval);

    if (initDisplay) this.view.setTimer(this.model.calculateTime(time));

    this.model.interval = setInterval(() => {
      this.view.setTimer(this.model.calculateTime(time));
    }, 1000);
  }

  // Displays history details
  showHistoryDetail(startTime) {
    const data = this.model.getHistory(startTime);

    this.view.setTimer(this.model.calculateTime(null, data), false);
    this.view.el("#history-start-time").textContent = new Date(data.startTime);
    this.view.el("#history-end-time").textContent = new Date(data.endTime);
    this.view.el("#history-reason").value = data.reason;

    this.view.historyDetailModal.show();
  }

  // Renders session history and updates the UI
  renderSession() {
    if (this.model.session.isRunning) this.start(this.model.session.time, true);

    this.view.el("#history-wrapper").innerHTML = this.model.session.history
      .map(({ moment, startTime, endTime }) => this.view.generateHistoryItem(moment, startTime, endTime))
      .join("");
  }
}
