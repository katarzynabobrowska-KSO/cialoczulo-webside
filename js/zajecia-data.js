/**
 * ============================================================
 *  ZAJĘCIA — edytuj TUTAJ pojedyncze terminy (nie cykl tygodniowy)
 * ============================================================
 *
 * Każdy wiersz = jedno konkretne zajęcia w konkretnym dniu.
 *
 * Pola:
 *   id       — unikalny kod (np. "2026-06-03-18")
 *   date     — data: "RRRR-MM-DD"
 *   time     — godzina: "GG:MM"
 *   title    — nazwa zajęć
 *   location — gdzie (adres lub nazwa studia)
 *
 * --- Google Sheets (opcjonalnie) ---
 * Kolumny: data | godzina | nazwa | miejsce
 * Link CSV wklej w sheetsCsvUrl poniżej.
 */

window.ZAJECIA_CONFIG = {
  sheetsCsvUrl: ""
};

window.ZAJECIA_DATA = [
  { id: "2026-06-03-18", date: "2026-06-03", time: "18:00", title: "Hatha joga",        location: "Studio Serce, ul. Przykładowa 12, Warszawa" },
  { id: "2026-06-05-10", date: "2026-06-05", time: "10:00", title: "Hatha joga",        location: "Studio Serce, ul. Przykładowa 12, Warszawa" },
  { id: "2026-06-12-10", date: "2026-06-12", time: "10:00", title: "Joga relaksacyjna", location: "Sala Parkowa, ul. Zielona 5, Warszawa" },
  { id: "2026-06-17-18", date: "2026-06-17", time: "18:00", title: "Hatha joga",        location: "Studio Serce, ul. Przykładowa 12, Warszawa" },
  { id: "2026-06-24-18", date: "2026-06-24", time: "18:00", title: "Joga relaksacyjna", location: "Sala Parkowa, ul. Zielona 5, Warszawa" },
  { id: "2026-07-01-18", date: "2026-07-01", time: "18:00", title: "Hatha joga",        location: "Studio Serce, ul. Przykładowa 12, Warszawa" }
];
