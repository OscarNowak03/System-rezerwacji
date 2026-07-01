# System rezerwacji zasobów

System rezerwacji zasobów jest aplikacją webową umożliwiającą zarządzanie rezerwacjami sal przez różne firmy. Aplikacja pozwala na ewidencjonowanie firm i dostępnych zasobów, tworzenie nowych rezerwacji oraz monitorowanie wykorzystania sal za pomocą interaktywnego kalendarza i panelu statystyk.

Projekt został wykonany w technologii Node.js z wykorzystaniem bazy danych SQLite oraz biblioteki FullCalendar do prezentacji harmonogramu rezerwacji.

---

## Wymagania funkcjonalne

- dodawanie firm,
- usuwanie firm,
- dodawanie sal,
- usuwanie sal,
- dodawanie rezerwacji,
- usuwanie rezerwacji,
- zmiana terminu metodą drag&drop,
- kontrola kolizji,
- przegląd kalendarza,
- statystyki miesięczne.

## Wymagania niefunkcjonalne
prosty interfejs,
responsywność podstawowego układu,
szybka odpowiedź aplikacji,
lokalna baza danych SQLite,
łatwość rozbudowy.

--

## Główne funkcjonalności

### Zarządzanie firmami
- dodawanie nowych firm do systemu,
- usuwanie firm z listy aktywnych podmiotów,
- zachowanie historii rezerwacji wykonanych przez usunięte firmy.

### Zarządzanie zasobami (salami)
- dodawanie nowych sal do systemu,
- usuwanie nieużywanych sal,
- przypisywanie rezerwacji do konkretnych zasobów.

### Zarządzanie rezerwacjami
- tworzenie nowych rezerwacji poprzez wskazanie:
  - firmy,
  - sali,
  - daty i godziny rozpoczęcia,
  - daty i godziny zakończenia,
- usuwanie istniejących rezerwacji,
- automatyczna kontrola poprawności zakresu czasowego,
- wykrywanie kolizji rezerwacji dla tej samej sali.

### Kalendarz rezerwacji
- prezentacja wszystkich rezerwacji w formie interaktywnego kalendarza,
- dostępne widoki miesięczny oraz tygodniowy,
- możliwość przeciągania rezerwacji w celu zmiany terminu,
- szybkie uzupełnianie formularza rezerwacji poprzez kliknięcie wybranego terminu w kalendarzu,
- kolorowe oznaczenie rezerwacji w zależności od firmy.

### Statystyki i raportowanie
Aplikacja generuje podstawowe statystyki dotyczące wykorzystania systemu:

- liczba rezerwacji w wybranym miesiącu,
- liczba aktywnych firm,
- liczba wykorzystywanych sal,
- ranking najczęściej rezerwowanych sal,
- analiza czasu wykorzystania sal przez poszczególne firmy.

Dane prezentowane są w postaci wskaźników oraz wykresów generowanych za pomocą biblioteki Chart.js.

---

## Stylowanie

Projekt nie posiada osobnego pliku CSS.  
Style są zawarte bezpośrednio w pliku `index.html` w sekcji `<style>` w nagłówku dokumentu.

---

## Technologie

### Backend
- Node.js
- Express.js
- SQLite

### Frontend
- HTML5
- CSS3
- JavaScript

### Biblioteki
- FullCalendar
- Chart.js

---

## Struktura projektu

```text
/backend
    index.js
    db.js
    database.sqlite

/frontend
    index.html
    script.js

package.json
package-lock.json
```

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

---

## Charakterystyka projektu

Aplikacja została zaprojektowana jako prosty system wspomagający zarządzanie rezerwacjami zasobów w organizacji. Głównym celem projektu było połączenie interaktywnego kalendarza, zarządzania danymi oraz prezentacji statystyk w jednym, spójnym systemie działającym lokalnie.

---

