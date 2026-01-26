<!--
File: README.md
Purpose: Project documentation: local development (Docker), Jekyll structure, and GitHub Pages deployment.
How to use: Start locally with `docker compose up --build --build`. Deploy via GitHub Pages (Actions).
Related files:
  - docker-compose.yml
  - Dockerfile
  - .github/workflows/pages.yml
  - _config.yml
Safe edits:
  - OK: Edit text and links; keep commands in sync with docker-compose.yml and workflow
  - Careful: Changing baseurl guidance without updating workflow can break asset paths
-->

# urv-sdgs-dashboard (jekyll)

Aquest repositori és una versió **Jekyll** del dashboard (HTML/CSS/JS), pensada per:

- treballar **en local amb Docker** (sense instal·lar Ruby al sistema)
- publicar a **GitHub Pages** mitjançant **GitHub Actions** (build + deploy)

## Estructura

- `index.html` i `pages/*.html`: pàgines amb *front matter* de Jekyll
- `_layouts/` i `_includes/`: capçalera, topbar, sidebar, footer
- `assets/`: CSS/JS/imatges
- `data/` i `downloads/`: fitxers servits com a estàtics

## Desenvolupament en local amb Docker (recomanat)

1) Arrenca el servidor:

```bash
docker compose up --build
```

2) Obre:

- http://localhost:4000

Notes:
- El *live reload* està activat.
- Es crea un volum `bundle_cache` per no reinstal·lar gems cada cop.

### Build local (sense servidor)

```bash
docker compose run --rm jekyll bundle exec jekyll build
```

## Desenvolupament en local sense Docker (opcional)

Requisits: Ruby + Bundler

```bash
bundle install
bundle exec jekyll serve
```

## Publicació a GitHub Pages

El repositori inclou el workflow:

- `.github/workflows/pages.yml`

Aquest workflow fa:
1) `bundle install`
2) `jekyll build` amb `--baseurl` calculat automàticament per a Pages
3) puja `_site/` com a artifact i desplega

A GitHub:
- Settings → Pages → **Source: GitHub Actions**

## Configuració de `baseurl`

A `_config.yml` tens:

```yml
baseurl: ""
url: ""
```

- Per a **project pages** (ex. `https://usuari.github.io/nom-repo/`), el workflow ja construeix amb el `baseurl` correcte.
- Per a **user/org pages** (ex. `https://usuari.github.io/`), el `baseurl` resultant serà `/`.

