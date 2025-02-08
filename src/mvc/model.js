export default class Model {
  constructor() {
    // Initial session state
    this.session = {
      time: null,
      isRunning: false,
      history: [],
    };

    this.interval = null;
  }

  // Retrieves a specific history entry by start time
  getHistory(startTime) {
    return this.session.history.find((item) => item.startTime == startTime);
  }

  // Deletes a specific history entry and saves the updated session
  deleteHistory(startTime) {
    const index = this.session.history.findIndex((item) => item.startTime == startTime);
    if (index !== -1) {
      this.session.history.splice(index, 1);
      this.saveSession();
    }
  }

  // Resets the session state and clears any running interval
  reset() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.session.isRunning = false;
    this.session.time = null;
  }

  // Calculates elapsed time with optional modal reference
  calculateTime(time, modal = null) {
    if (modal) {
      const [currentTime, currentUnit] = modal.moment.split(" ");
      const { years, months, days, hours, minutes, seconds, raw } = TickAgo.compare(modal.startTime, modal.endTime);
      return [currentTime, currentUnit, years, months, days, hours, minutes, seconds, raw];
    }

    const moment = TickAgo.moment(time, {
      labels: { sec: "@sec", minutes: "@minutes", hours: "@hours", days: "@days", months: "@months", years: "@years" },
    });

    const [currentTime, currentUnit] = moment.split("@");
    const { years, months, days, hours, minutes, seconds, raw } = TickAgo.compare(time, Date.now());
    return [currentTime, currentUnit, years, months, days, hours, minutes, seconds, raw];
  }

  // Loads session data from localStorage
  syncSession() {
    const session = localStorage.getItem("bbk_session");
    if (session) {
      this.session = JSON.parse(session);
    }
  }

  // Saves session data to localStorage
  saveSession() {
    localStorage.setItem("bbk_session", JSON.stringify(this.session));
  }

  // Imports a session from a file
  importSession(file, callback = () => {}) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      callback(data);
    };
    reader.readAsText(file);
  }

  // Exports the session data as a downloadable file
  exportSession() {
    const blob = new Blob([JSON.stringify(this.session)], { type: "application/json" });
    return URL.createObjectURL(blob);
  }
}
