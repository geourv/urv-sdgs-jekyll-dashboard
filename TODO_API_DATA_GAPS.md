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

---

## Nota operativa per a IA

Si falta una dada:

- No fer inferències complexes al frontend.
- No inventar camps.
- Registrar-ho aquí i deixar un comportament explícit a la UI.
