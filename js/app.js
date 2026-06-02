(function () {
  let classes = [];
  let selectedDay = null;
  const weekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
  let calendarMonth = new Date();

  function formatPolishDate(dateStr) {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pl-PL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  function formatClassLabel(item) {
    return `${formatPolishDate(item.date)}, ${item.time} — ${item.title}`;
  }

  function makeId(date, time) {
    return `${date}-${time.replace(":", "")}`;
  }

  function parseCsvRow(line) {
    const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    return parts.map((part) => part.trim().replace(/^"|"$/g, ""));
  }

  function parseCsvToClasses(csv) {
    const lines = csv.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const [date, time, title, location] = parseCsvRow(line);
      return {
        id: makeId(date, time),
        date,
        time,
        title,
        location: location || ""
      };
    }).filter((item) => item.date && item.time && item.title);
  }

  function sortedClasses() {
    return [...classes].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  function classesOnDate(year, month, day) {
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(month + 1).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    return sortedClasses().filter((item) => item.date === dateStr);
  }

  async function loadClasses() {
    const url = window.ZAJECIA_CONFIG?.sheetsCsvUrl;
    if (url) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const fromSheets = parseCsvToClasses(await response.text());
          if (fromSheets.length) return fromSheets;
        }
      } catch (error) {
        console.warn("Nie udało się wczytać Google Sheets, używam danych lokalnych.", error);
      }
    }
    return window.ZAJECIA_DATA || [];
  }

  function sessionCardHtml(item) {
    return `
      <div class="session-card">
        <div class="session-card-body">
          <p class="session-title">${item.title}</p>
          <p class="schedule-meta">${formatPolishDate(item.date)} · ${item.time}</p>
          <p class="schedule-location">${item.location}</p>
        </div>
        <a href="#kontakt" class="button small primary btn-signup" data-class-id="${item.id}">Zapisz się</a>
      </div>
    `;
  }

  function stopPanelClose(event) {
    event.stopPropagation();
  }

  function formatEventLabel(item) {
    if (item.date) {
      return `${item.title} — ${formatPolishDate(item.date)}`;
    }
    return item.title;
  }

  function syncSignupFields() {
    const typeSelect = document.getElementById("signup-type");
    const classWrap = document.getElementById("field-class-wrap");
    const eventWrap = document.getElementById("field-event-wrap");
    const classSelect = document.getElementById("class");
    const eventSelect = document.getElementById("event");

    if (!typeSelect || !classWrap || !eventWrap) return;

    const type = typeSelect.value;
    const isClass = type === "zajecia";
    const isEvent = type === "wydarzenie";

    classWrap.hidden = !isClass;
    eventWrap.hidden = !isEvent;
    classSelect.required = isClass;
    eventSelect.required = isEvent;

    if (!isClass) classSelect.value = "";
    if (!isEvent) eventSelect.value = "";
  }

  function prepareContactForm({ type = "zajecia", classId = "", eventId = "" } = {}) {
    const typeSelect = document.getElementById("signup-type");
    if (typeSelect) typeSelect.value = type;
    syncSignupFields();

    const classSelect = document.getElementById("class");
    const eventSelect = document.getElementById("event");
    if (classSelect && type === "zajecia" && classId) classSelect.value = classId;
    if (eventSelect && type === "wydarzenie" && eventId) eventSelect.value = eventId;
  }

  function bindContactLinks(root) {
    root.querySelectorAll(".btn-contact, .btn-signup").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        stopPanelClose(event);
        prepareContactForm({
          type: btn.dataset.signupType || "zajecia",
          classId: btn.dataset.classId || "",
          eventId: btn.dataset.eventId || ""
        });
      });
    });
  }

  function renderDayDetail(year, month, day) {
    const detail = document.getElementById("calendar-day-detail");
    const dayClasses = classesOnDate(year, month, day);

    if (!dayClasses.length) {
      detail.hidden = true;
      detail.innerHTML = "";
      return;
    }

    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    detail.hidden = false;
    detail.innerHTML = `
      <h3>${formatPolishDate(dateStr)}</h3>
      <div class="session-cards">${dayClasses.map(sessionCardHtml).join("")}</div>
    `;
    bindContactLinks(detail);
  }

  function renderScheduleList() {
    const list = document.getElementById("schedule-list");
    list.innerHTML = sortedClasses().map((item) => `<li>${sessionCardHtml(item)}</li>`).join("");
    bindContactLinks(list);
  }

  function renderCalendar() {
    const grid = document.getElementById("calendar-grid");
    const title = document.getElementById("calendar-title");
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;

    title.textContent = firstDay.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });

    let html = weekdays.map((day) => `<span class="weekday">${day}</span>`).join("");
    for (let i = 0; i < startOffset; i += 1) {
      html += `<span class="calendar-day empty" aria-hidden="true"></span>`;
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const hasClass = classesOnDate(year, month, day).length > 0;
      const isSelected = selectedDay && selectedDay.year === year && selectedDay.month === month && selectedDay.day === day;
      html += `<button type="button" class="calendar-day${hasClass ? " has-class" : ""}${isSelected ? " selected" : ""}" data-day="${day}"${hasClass ? "" : " disabled"}>${day}</button>`;
    }
    grid.innerHTML = html;

    grid.querySelectorAll(".calendar-day.has-class").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        stopPanelClose(event);
        selectedDay = { year, month, day: Number(btn.dataset.day) };
        renderCalendar();
        renderDayDetail(year, month, selectedDay.day);
      });
    });

    if (selectedDay && selectedDay.year === year && selectedDay.month === month) {
      renderDayDetail(year, month, selectedDay.day);
    } else {
      const detail = document.getElementById("calendar-day-detail");
      if (detail) {
        detail.hidden = true;
      }
    }
  }

  function renderClassSelect() {
    const select = document.getElementById("class");
    if (!select) return;
    select.innerHTML = [
      `<option value="">— wybierz termin —</option>`,
      ...sortedClasses().map((item) => `<option value="${item.id}">${formatClassLabel(item)}</option>`)
    ].join("");
  }

  function renderClassTypes() {
    const container = document.getElementById("class-types-list");
    if (!container) return;

    const types = window.TYPY_ZAJEC_DATA || [];
    container.innerHTML = types.map((type) => classTypeCardHtml(type)).join("");
    bindContactLinks(container);
    container.querySelectorAll(".class-type-actions a:not(.btn-contact)").forEach((link) => {
      link.addEventListener("click", stopPanelClose);
    });
  }

  function classTypeCardHtml(type) {
    return `
      <div class="class-type-card">
        <span class="image main class-type-image">
          <img src="${type.image}" alt="${type.title}" loading="lazy" />
        </span>
        <p class="class-type-title">${type.title}</p>
        <p class="class-type-description">${type.description}</p>
        <p class="class-type-address">
          <span class="class-type-label">Gdzie:</span> ${type.address}
        </p>
        <ul class="actions class-type-actions">
          <li><a href="#zajecia" class="button small">Zobacz terminy</a></li>
          <li><a href="#kontakt" class="button small primary btn-contact" data-signup-type="zajecia">Zapisz się</a></li>
        </ul>
      </div>
    `;
  }

  function eventCardHtml(item) {
    const dateLine = item.date
      ? `<p class="schedule-meta">${formatPolishDate(item.date)}</p>`
      : "";
    return `
      <div class="class-type-card event-card">
        <span class="image main class-type-image">
          <img src="${item.image}" alt="${item.title}" loading="lazy" />
        </span>
        <p class="class-type-title">${item.title}</p>
        <p class="class-type-description">${item.description}</p>
        ${dateLine}
        <p class="class-type-address">
          <span class="class-type-label">Gdzie:</span> ${item.location}
        </p>
        <ul class="actions class-type-actions">
          <li><a href="${item.facebookUrl}" target="_blank" rel="noopener" class="button small icon brands fa-facebook-f">Facebook</a></li>
          <li><a href="#kontakt" class="button small primary btn-contact" data-signup-type="wydarzenie" data-event-id="${item.id}">Zapisz się</a></li>
        </ul>
      </div>
    `;
  }

  function renderEventSelect() {
    const select = document.getElementById("event");
    if (!select) return;
    const events = window.WYDARZENIA_DATA || [];
    select.innerHTML = [
      `<option value="">— wybierz wydarzenie —</option>`,
      ...events.map((item) => `<option value="${item.id}">${formatEventLabel(item)}</option>`)
    ].join("");
  }

  function renderEvents() {
    const container = document.getElementById("events-list");
    if (!container) return;

    const events = window.WYDARZENIA_DATA || [];
    container.innerHTML = events.map((item) => eventCardHtml(item)).join("");
    bindContactLinks(container);
    container.querySelectorAll(".class-type-actions a[target='_blank']").forEach((link) => {
      link.addEventListener("click", stopPanelClose);
    });
  }

  function bindUi() {
    const prev = document.getElementById("prev-month");
    const next = document.getElementById("next-month");

    if (prev) {
      prev.addEventListener("click", (event) => {
        stopPanelClose(event);
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        selectedDay = null;
        renderCalendar();
      });
    }

    if (next) {
      next.addEventListener("click", (event) => {
        stopPanelClose(event);
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        selectedDay = null;
        renderCalendar();
      });
    }

    const signupType = document.getElementById("signup-type");
    if (signupType) {
      signupType.addEventListener("change", syncSignupFields);
    }

    const signupForm = document.getElementById("signup-form");
    const formSuccess = document.getElementById("form-success");

    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const type = document.getElementById("signup-type")?.value;
        if (type === "zajecia" && !document.getElementById("class")?.value) {
          alert("Wybierz termin zajęć.");
          return;
        }
        if (type === "wydarzenie" && !document.getElementById("event")?.value) {
          alert("Wybierz wydarzenie.");
          return;
        }

        const response = await fetch(signupForm.action, {
          method: "POST",
          body: new FormData(signupForm),
          headers: { Accept: "application/json" }
        });

        if (response.ok) {
          signupForm.reset();
          renderClassSelect();
          renderEventSelect();
          syncSignupFields();
          if (formSuccess) formSuccess.classList.add("is-visible");
        } else {
          alert("Nie udało się wysłać formularza. Spróbuj maila: twoj@email.pl");
        }
      });
    }
  }

  async function init() {
    classes = await loadClasses();
    if (classes.length) {
      const first = new Date(classes[0].date + "T12:00:00");
      calendarMonth = new Date(first.getFullYear(), first.getMonth(), 1);
    }
    bindUi();
    renderClassTypes();
    renderEvents();
    renderCalendar();
    renderScheduleList();
    renderClassSelect();
    renderEventSelect();
    syncSignupFields();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
