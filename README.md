# ZETA Web MVP — live catalog prototype

This version keeps the GitHub Pages frontend, but adds a real data pipeline:

- `scripts/scrape_zeta.py` reads the official Astana ZETA catalog pages.
- It opens product pages and extracts name, article, price, product URL and store stock shown by ZETA.
- `.github/workflows/update-zeta-data.yml` runs daily and can also be started manually from GitHub Actions.
- The frontend reads `data.json` and searches the downloaded catalog locally, so GitHub Pages does not need CORS access to zeta.kz.

## Important

ZETA itself says store availability on the website is approximate and recommends confirming exact availability with the store. The app therefore labels the source as official ZETA and shows the update time.

The scraper is intentionally limited to 250 products / 20 catalog pages per run for an MVP. Increase `MAX_PAGES` and `MAX_PRODUCTS` after testing and with ZETA's permission if you want broader coverage.

## GitHub Pages

1. Upload the repository files to GitHub.
2. Enable Pages from `main` / root.
3. Open **Actions → Update ZETA catalog → Run workflow** once.
4. After the workflow finishes, refresh the site.

The workflow needs write permission to commit `data.json` (`Settings → Actions → General → Workflow permissions → Read and write permissions` if your repository settings require it).
