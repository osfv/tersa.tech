# tersa.tech

Source for [tersa.tech](https://tersa.tech), the website for Tersa's open-source tools. GitHub Pages serves it as plain HTML, CSS and JavaScript with no build step.

`.github/workflows/pages.yml` publishes the site on every push to `main` and every third day. Each run copies the BraveDebloater star count from the GitHub API into the `<span data-stars>` in `index.html`, and its OpenSSF Scorecard score from api.scorecard.dev into `<span data-scorecard>`. The numbers committed there are the fallback if an API call fails. GitHub pauses scheduled workflows after 60 days without a commit, so push something or re-enable the workflow under Actions if the count stops moving.

## License

This repository is not open source. © 2026 Vince. All rights reserved. That covers the site's text, design, code and the Tersa name and mark. GitHub's terms let you view and fork it on GitHub, but you need permission to reuse any of it elsewhere.

Exceptions:

- The Geist and Geist Mono fonts in `assets/fonts/` belong to The Geist Project Authors and ship under the SIL Open Font License 1.1. See `assets/fonts/OFL.txt`.
- Each tool has its own license in its own repository. [BraveDebloater](https://github.com/osfv/BraveDebloater) uses the MIT License, which covers that tool only and not this site.
