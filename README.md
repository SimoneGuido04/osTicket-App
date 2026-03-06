# osTicket Mobile App (React Native / Expo)

Un'applicazione mobile moderna, sviluppata in React Native con Expo, per la gestione e la consultazione dei ticket di supporto dal sistema **osTicket**.
L'app si interfaccia con un'API backend personalizzata basata su **BMSVieira osTicket API**.

## ✨ Funzionalità

*   **Autenticazione Agente:** Accesso sicuro con Email e API Key di osTicket.
*   **Supporto Biometrico:** Possibilità di memorizzare le credenziali tramite Face ID e Impronta Digitale.
*   **Dashboard Statistica:** Panoramica in tempo reale sui ticket aperti, scaduti e assegnati a te.
*   **Gestione Ticket:** Visualizzazione, ricerca e filtro dei ticket (Aperti, Chiusi, ecc.).
*   **Visualizzazione Dettagli:** Thread completo del ticket, con messaggi e risposte formattati chiaramente.
*   **Risposte Dirette:** Rispondi ai ticket direttamente dall'app con il tuo nome utente corretto.
*   **Tema Chiaro / Scuro:** Toggle integrato nelle Impostazioni per cambiare il tema a piacimento (Dark/Light mode native via NativeWind).

---

## 🚀 Architettura

1.  **Frontend App:** Scritta in React Native (Expo Router) e TypeScript. Stilizzata con NativeWind (Tailwind CSS per React Native).
2.  **Backend API:** Un middleware PHP caricato sulla stessa macchina server di osTicket (nella cartella `/upload/ost_wbs/`) che fa da ponte tra il database e l'applicazione mobile.

---

## 🛠 Istruzioni di Installazione: Lato Server (API)

Per far comunicare l'app con la tua installazione di osTicket, è **necessario** installare il web service. Noi abbiamo esteso l'ottimo progetto BMSVieira con alcune modifiche specifiche per i mobile.

1. Alza i file contenuti nella cartella `api_src/osticket-api-main/ost_wbs/` e copiali sul tuo server web, dentro la cartella principale di osTicket (generalmente `/var/www/html/upload/ost_wbs/` o nel tuo DocumentRoot).
2. Entra in `config.php` nella cartella appena copiata. Compila le informazioni del Database di osTicket:
   ```php
   define('DBHOST','il_tuo_host');
   define('DBUSER','il_tuo_utente_db');
   define('DBPASS','la_tua_password_db');
   define('DBNAME','il_tuo_database_osticket');
   ```
3. Assicurati di impostare l'API Key (`CANCREATE`, ecc.) come da documentazione, e appunta l'API Key perché servirà nell'app.
4. **Modifiche Custom Apportate (Già incluse nel pacchetto):**
   *   `class.ticket.php` e `class.user.php`: Consentono l'accettazione del metodo `POST` e non solo `GET`. React Native, per standard di rete, rimuove i body JSON dalle chiamate `GET`.
   *   `class.ticket.php`: Aggiornato per permettere il payload `user_id` durante le Reply, in modo da attribuire correttamente il messaggio all'utente vero invece di sovrascriverlo ad agenti casuali.
   *   `class.user.php`: Aggiunto il parametro di tracciamento `staff_email` per riconoscere in modo sicuro gli operatori autorizzati a fare login in app dal pannello agenti.
   *   `class.helper.php`: Risolti problemi di stringhe "0" valutate come vuote.

---

## 📱 Istruzioni di Installazione: Lato App (React Native)

Questa è un'applicazione basata su Expo.

### Prerequisiti:
*   Node.js installato (versione 18 o superiore consigliata)
*   Account Expo (opzionale per Expo Go)
*   Sul telefono: l'app **Expo Go** (oppure un emulatore avviato su PC).

### Avvio:
1. Clona questo repository e spostati all'interno della cartella principale del progetto:
   ```bash
   git clone <repo_url>
   cd osTicket-App-master
   ```
2. Installa le dipendenze:
   ```bash
   npm install
   ```
3. Avvia il server di sviluppo di Expo (pulendo la cache se necessario):
   ```bash
   npx expo start --clear
   ```
4. Scansiona il **QR Code** con la fotocamera del tuo iPhone, o direttamente dentro l'app Expo Go per Android.

### Build Nativa
Se decidi di esportare l'app come `.apk` (Android) o `.ipa` (iOS) anziché usare Expo Go, puoi utilizzare gli script integrati:
```bash
npx expo prebuild
npx expo run:android
# oppure
npx expo run:ios
```
*(Attenzione: Il progetto contiene un plugin `withNetworkSecurityConfig.js` progettato per supportare i certificati SSL Autenticati o Self-Signed su server di sviluppo interni, rendendo facile il deployment aziendale per Android. Questa configurazione è attiva quando si effettua la prebuild nativa).*

---

## 🎨 Note di Design (Tema Chiaro e Scuro)

L'applicazione utilizza **NativeWind** (Tailwind v3/v4). Supporta appieno colori personalizzati (es. il verde acqua primario `#128c7e`) e riconosce le classi `dark:`.
La pagina **Profilo** include un toggle per forzare la Dark Mode o riportarla alla Light Mode chiara in qualsiasi momento; lo state è gestito nativamente passando il colorScheme in tempo reale.

## Licenza
Questo wrapper mobile e la configurazione estesa dell'API sono progettati ad-hoc per integrarsi dinamicamente in workflow osTicket. Fare riferimento alle licenze originali di BMSVieira API.
