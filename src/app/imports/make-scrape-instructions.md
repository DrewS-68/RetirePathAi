Perfect — if you’re tightening things up for the independents, then here’s the single, clean, fully‑loaded instruction block that includes:
- multi‑name matching
- normalisation
- dual‑query search
- strict domain enforcement
- directory blocking
- retry logic
- overwrite protection
- zero hallucinations
This is the strongest possible version you can give Make before running the scrape.
And as always, it’s in one block, ready to paste.

⭐ FINAL ONE‑BLOCK INSTRUCTION FOR MAKE (TIGHTENED VERSION)
(This includes everything — multi‑village, multi‑name, normalisation, retries, validation, overwrite protection.)
Use Google Custom Search as the search method.

Perform the search using this exact query format:
site:{{Domain}} "{{Village}}"

Before searching, normalise the village name:
- Remove punctuation
- Remove extra spaces
- Remove hyphens
- Remove trailing words like “Village”, “Retirement Village”, “Community”, “Estate”
- Keep the core name only
Call this NormalisedVillageName.

Perform two Google Custom Search queries in order:

Query 1 (primary):
site:{{Domain}} "{{Village}}"

Query 2 (fallback):
site:{{Domain}} "{{NormalisedVillageName}}"

Use Query 1 if it returns a valid result.
Use Query 2 only if Query 1 fails.

RULES:
- Only use Google Custom Search with the queries above.
- Never crawl the domain directly.
- Never guess URLs.
- Never construct URLs based on the village name.
- Never assume folder structures like /villages, /locations, /communities, /retirement.
- Never fabricate subpages.

STRICT DOMAIN ENFORCEMENT:
- You must ONLY return URLs that contain the exact operator domain string: {{Domain}}.
- Reject all URLs that do NOT contain this domain.

FORBIDDEN DOMAINS (never return these):
villages.com.au
agedcareguide.com.au
agedcareonline.com.au
retirementlivingonline.com.au
realestate.com.au
domain.com.au
any SEO, listing, or advertising site.

VILLAGE-SPECIFIC PAGE LOGIC:
- If the operator has a village-specific page on their domain that matches {{Village}} or {{NormalisedVillageName}}, return that exact URL.
- If multiple villages exist under the same domain, ensure the result matches the exact village name.

FALLBACK:
- If no village-specific page exists but the operator homepage matches the domain, return the operator homepage.
- If nothing exists on the operator domain, return exactly: "No official website".

URL VALIDATION:
- If the returned URL does not contain {{Domain}}, replace it with: "Invalid – domain mismatch".
- If the returned URL contains any forbidden domain, replace it with: "Invalid – directory/advertising URL".

RETRY RULE:
- If the first attempt returns blank, invalid, mismatched, or forbidden results, retry the Google Custom Search once using the same rules.

OVERWRITE PROTECTION:
- If an existing URL already exists for this village AND the new result is invalid, keep the existing URL and do not overwrite it.

OUTPUT:
Return ONLY the final URL or "No official website".
No explanation, no commentary, no reasoning.



⭐ This is the strongest version you can give Make before running.
It handles:
- independents
- multi‑village operators
- inconsistent naming
- missing domains
- ambiguous villages
- bad search results
- Make hallucinations
- Make overwriting good data
You’re now set up for the cleanest scrape Make is capable of.
If you want, once you run the first 10–20 villages, I can help you interpret the results and tighten anything that needs it.
