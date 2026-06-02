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
      <article class="session-card">
        <div>
          <strong>${item.title}</strong>
          <p class="schedule-meta">${formatPolishDate(item.date)} · ${item.time}</p>
          <p class="schedule-location">${item.location}</p>
        </div>
        <button type="button" class="button small btn-signup" data-class-id="${item.id}">Zapisz się</button>
      </article>
    `;
  }

  function bindSignupButtons(root) {
    root.querySelectorAll(".btn-signup").forEach((btn) => {
      btn.addEventListener("click", () => openSignup(btn.dataset.classId));
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
    bindSignupButtons(detail);
  }

  function renderScheduleList() {
    const list = document.getElementById("schedule-list");
    list.innerHTML = sortedClasses().map((item) => `<li>${sessionCardHtml(item)}</li>`).join("");
    bindSignupButtons(list);
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
      btn.addEventListener("click", () => {
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

  function openSignup(classId) {
    const select = document.getElementById("class");
    if (select) select.value = classId;

    const navLink = document.querySelector('nav a[href="#kontakt"]');
    if (navLink) {
      navLink.click();
      window.setTimeout(() => {
        const form = document.getElementById("signup-form");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 400);
    }
  }

  function bindUi() {
    const prev = document.getElementById("prev-month");
    const next = document.getElementById("next-month");

    if (prev) {
      prev.addEventListener("click", () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
        selectedDay = null;
        renderCalendar();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
        selectedDay = null;
        renderCalendar();
      });
    }

    const signupForm = document.getElementById("signup-form");
    const formSuccess = document.getElementById("form-success");

    if (signupForm) {
      signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const response = await fetch(signupForm.action, {
          method: "POST",
          body: new FormData(signupForm),
          headers: { Accept: "application/json" }
        });

        if (response.ok) {
          signupForm.reset();
          renderClassSelect();
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
    renderCalendar();
    renderScheduleList();
    renderClassSelect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
