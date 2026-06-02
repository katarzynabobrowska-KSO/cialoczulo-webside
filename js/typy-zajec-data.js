/**
 * ============================================================
 *  RODZAJE ZAJĘĆ — edytuj TUTAJ opisy, adresy i zdjęcia
 * ============================================================
 *
 * Pola każdego wpisu:
 *   id          — krótki kod (np. "hatha"), opcjonalnie do linków
 *   title       — nazwa zajęć (np. "Hatha joga")
 *   description — opis dla uczestników (kilka zdań)
 *   address     — gdzie się odbywają (pełny adres lub nazwa studia)
 *   image       — ścieżka do zdjęcia w folderze images/
 *                 (np. "images/moja-hatha.jpg" — wrzuć plik do images/)
 */

window.TYPY_ZAJEC_DATA = [
  {
    id: "hatha",
    title: "Hatha joga",
    description:
      "Spokojne zajęcia dla początkujących i średniozaawansowanych. Skupiamy się na oddechu, podstawowych pozycjach i bezpiecznym rozciąganiu. Idealne, jeśli dopiero zaczynasz lub wracasz na matę po przerwie.",
    address: "Studio Serce, ul. Przykładowa 12, Warszawa",
    image: "images/pic01.jpg"
  },
  {
    id: "relaksacyjna",
    title: "Joga relaksacyjna",
    description:
      "Łagodny rytm, dłuższe utrzymywanie pozycji i ćwiczenia uspokajające układ nerwowy. Polecane po intensywnym tygodniu lub gdy potrzebujesz wyciszenia i regeneracji.",
    address: "Sala Parkowa, ul. Zielona 5, Warszawa",
    image: "images/pic03.jpg"
  },
  {
    id: "poranna",
    title: "Joga poranna",
    description:
      "Krótszy format na start dnia — rozruszanie ciała, praca z oddechem i delikatne wzmocnienie. Zajęcia w kameralnej grupie, w miłej, spokojnej atmosferze.",
    address: "Studio Serce, ul. Przykładowa 12, Warszawa",
    image: "images/pic02.jpg"
  }
];
