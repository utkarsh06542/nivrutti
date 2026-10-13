NIVRUTTI - retirement money planner for India
================================================

How to open it
--------------
1. Unzip this folder anywhere on your computer.
2. Double-click index.html. It opens in your web browser.
   No installation or internet is needed (fonts load from Google when online;
   without internet the site uses your computer's fonts).

Pages
-----
index.html          Home and "who are you" picker
plan.html           Enter your details, one step at a time
results.html        Your plan: summary, buckets, where each rupee goes
risk.html, income.html, last.html, survivor.html, tax.html, next-steps.html
                    The other parts of your plan
calculators.html    Commutation, EPS, EPF, NPS, FIRE and health cover calculators
guides.html         Fourteen how-to guides (guide-*.html)
checklist.html, products.html, glossary.html, about.html

Your answers are saved in your own browser on this device. Nothing is sent anywhere.

Putting it online
-----------------
Upload the whole folder (keep the assets folder next to the pages) to any static
host: GitHub Pages, Netlify, Cloudflare Pages, or your own web server.

Editing
-------
assets/style.css   colours, fonts, layout
assets/engine.js   planning rules, scheme rates, persona defaults
assets/render.js   what each result page shows
assets/data.js     checklist, product list, glossary, calculators
assets/app.js      page wiring
Scheme rates (SCSS 8.2%, POMIS 7.4%, RBI bonds 8.05%) are for Oct-Dec 2026.
Update them each quarter in assets/engine.js.

This is an educational tool, not investment advice.
