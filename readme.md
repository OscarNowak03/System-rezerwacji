# System rezerwacji zasobów

Prosta aplikacja webowa do zarządzania rezerwacjami sal przez firmy.  
Projekt umożliwia dodawanie firm, zasobów (sal), tworzenie rezerwacji oraz przeglądanie statystyk w formie kalendarza i wykresów.

---

## Funkcje

- Zarządzanie firmami (dodawanie / usuwanie)
- Zarządzanie salami (zasobami)
- Tworzenie i usuwanie rezerwacji
- Kalendarz (FullCalendar)
- Statystyki i wykresy (Chart.js)
- Przeciąganie rezerwacji (drag & drop)
- Wykrywanie kolizji rezerwacji

---

## Technologie

- Node.js
- Express.js
- SQLite
- HTML / CSS / JavaScript
- FullCalendar
- Chart.js

---

## Struktura projektu


/backend
index.js
db.js

/frontend
index.html
script.js

package.json


---

## Uruchomienie projektu

1. Zainstaluj zależności:

npm install


2. Uruchom serwer:

node backend/index.js


3. Otwórz frontend:

frontend/index.html


---

## Uwagi

- Dane przechowywane są lokalnie w bazie SQLite
- Usunięcie firmy nie usuwa historii rezerwacji (zachowana spójność danych)
- Aplikacja działa lokalnie (localhost:3000)