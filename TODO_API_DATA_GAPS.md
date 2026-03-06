# TODO API Data Gaps

Llista de mancances de dades detectades al dashboard que s'han d'afegir al pipeline/API del tracker.

## Format recomanat d'entrada

- Data:
- Pàgina/app:
- Camp que falta:
- Impacte:
- Proposta API tracker:
- Estat: `pendent` | `en curs` | `resolt`

---

## Pendents oberts

### 1) Curs dins de l'ensenyament per assignatura

- Data: 2026-02-23
- Pàgina/app: `pages/course-details.html` (ODS per assignatura)
- Camp que falta: curs de l'ensenyament per assignatura (`primer`, `segon`, `tercer`, `quart`, etc.)
- Impacte: no es pot mostrar aquesta metadada de forma fiable al detall.
- Proposta API tracker: camp estable per assignatura, p. ex. `programme_year` (o equivalent consensuat).
- Estat: `pendent`

### 2) Volum de text per secció (número de paraules)

- Data: 2026-02-23
- Pàgina/app: visualitzacions amb anàlisi per secció (wordcloud, anell, radar, bombolles, detall)
- Camp que falta: nombre de paraules originals per secció (`n_words`) a més de `n_hits`.
- Impacte: no es poden contextualitzar deteccions respecte al volum de text.
- Proposta API tracker: afegir `n_words` per secció (competències, informació curs, referències, etc.) a nivell assignatura i agregats.
- Estat: `pendent`

### 3) Disponibilitat d'ensenyament per falta d'scraping

- Data: 2026-03-06
- Pàgina/app: selectors d'ensenyament de `wordcloud`, `anell`, `radar`, `bombolles` i `pages/course-details.html`
- Camp que falta: indicador explícit de disponibilitat d'anàlisi per ensenyament (p. ex. `scraping_available`) i motiu (`external_source`, `other_university`, `pending`, etc.)
- Impacte: alguns ensenyaments apareixen als combos però no tenen detall analitzable; això provoca errors o missatges confusos.
- Proposta API tracker: incloure al catàleg d'ensenyaments un camp booleà de disponibilitat i un camp de motiu/nota per mostrar missatges contextuals de forma fiable.
- Estat: `pendent`

---

## Nota operativa per a IA

Si falta una dada:

- No fer inferències complexes al frontend.
- No inventar camps.
- Registrar-ho aquí i deixar un comportament explícit a la UI.
