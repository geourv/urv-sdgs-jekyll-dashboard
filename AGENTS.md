# AGENTS.md

## Objectiu

Aquest repositori (`urv-sdgs-jekyll-dashboard`) conté la capa web (Jekyll + HTML/CSS/JS) de visualització.

La generació de dades (pipeline d'extracció, neteja, anàlisi i export) **no** es fa aquí: es fa al repositori **tracker** (`urv-sdgs-tracker`).

## Font de veritat de dades

- La font de veritat és l'API/JSON publicat pel tracker.
- Els JSON locals sota `data/` i `downloads/` s'han de tractar com a dades servides per la web, no com a lloc per inventar o reconstruir camps.
- Si falta un camp a l'API, no s'ha de "simular" al client.

## Regla clau quan falten dades

Quan una aplicació necessita una dada que no arriba:

1. **No** inventar dades.
2. **No** fer càlculs derivats complexos o heurístics en JS per substituir el camp absent.
3. **No** afegir "fallbacks intel·ligents" que amaguen el problema.
4. Mostrar un estat clar a la UI (missatge curt o camp no disponible).
5. Registrar la mancança a `TODO_API_DATA_GAPS.md`.

## Protocol de registre de mancances

Cada vegada que falti una dada necessària, afegir o actualitzar una entrada a:

- `TODO_API_DATA_GAPS.md`

Incloure:

- Data
- Pàgina/app afectada
- Camp que falta
- Impacte funcional
- Proposta de camp a l'API tracker
- Estat (`pendent`, `en curs`, `resolt`)

## Prioritat de canvis per a la IA

1. Corregir UI/UX i coherència visual.
2. Connectar correctament amb dades disponibles.
3. Si falten dades, documentar la mancança (fitxer TODO) abans d'intentar cap alternativa.

## No fer

- No moure la lògica del pipeline al frontend.
- No substituir absències de dades amb estimacions opaques.
- No crear esquemes nous de JSON local sense alinear-ho amb el tracker.
