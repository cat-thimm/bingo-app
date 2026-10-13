# Bingo

React + TypeScript + Tailwind (v4), Backend und Live-Sync über Supabase, Hosting auf Netlify.

## Wie es funktioniert

- **Nutzer:** Beim ersten Besuch bekommt jeder Browser automatisch ein anonymes Konto und gibt nur einen Namen ein. Kein Passwort, die Sitzung bleibt im Browser gespeichert. Die eigene Karte kann nur von diesem Browser verändert werden (Row Level Security).
- **Runde:** Jemand erstellt eine Runde (Titel, 4×4 / 5×5 / 6×6) und teilt den Einladungslink oder den 5-stelligen Code.
- **Karte:** Jeder schreibt seine eigenen Felder, optional per Liste einfügen, und kann sie mischen.
- **Gemeinsamer Tisch:** Alle Karten sind für alle sichtbar. Ein Tipp auf ein Feld kreuzt es durch, die anderen sehen das sofort.
- **Bingo:** Reihe, Spalte oder Diagonale. Alle bekommen "Paul hat Bingo!" mit den gewinnenden Feldern, plus Browser-Benachrichtigung, wenn aktiviert.

## Einrichtung

1. Projekt auf [supabase.com](https://supabase.com) anlegen.
2. **Authentication > Providers:** "Allow anonymous sign-ins" einschalten.
3. **SQL Editor:** Inhalt von `supabase/schema.sql` ausführen.
4. Unter **Project Settings > API** die Project URL und den anon public key kopieren.
5. Lokal: `.env.example` nach `.env` kopieren, Werte eintragen, dann:

```bash
npm install
npm run dev
```

## Auf Netlify veröffentlichen

1. Repo auf GitHub pushen und in Netlify "Import from Git" wählen. Build-Einstellungen kommen aus `netlify.toml`.
2. Unter **Site configuration > Environment variables** `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` setzen.
3. Deployen.

## Grenzen

- Benachrichtigungen erscheinen nur, solange die Seite im Browser offen ist (auch im Hintergrund-Tab). Für Meldungen bei komplett geschlossener Seite bräuchte es Web Push mit Service Worker und Push-Server.
- Der Gewinn wird im Browser des Spielers berechnet. Für Freunde reicht das, gegen Schummler ist es nicht abgesichert.
- Wer den Browser-Speicher löscht oder das Gerät wechselt, verliert den Zugriff auf die eigene Karte.
# bingo-app
