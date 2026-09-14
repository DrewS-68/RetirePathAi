Here you go, Drew — this is the single, unified, copy‑ready instruction block you can paste directly into Make as your answer to:
“What method should I use for the actual search step?”

It tells Make exactly what to do, using Option A (Google Custom Search) with the correct query structure, and includes all the guardrails you need.
No sections.
No breaks.
No commentary.
Just one clean instruction block.

⭐ PASTE THIS INTO MAKE
Use Google Custom Search as the search method.

Perform the search using this exact query format:
site:{{Domain}} "{{Village}}"

This ensures the search is restricted to the operator’s official domain and targets the specific village name.

RULES:
- Only use Google Custom Search with the query: site:{{Domain}} "{{Village}}"
- Never crawl the domain directly.
- Never guess URLs.
- Never construct URLs based on the village name.
- Never assume folder structures like /villages, /locations, /communities, /retirement.
- Never return results from directories, ads, or aggregator sites.

Forbidden domains (never return these):
villages.com.au
agedcareguide.com.au
agedcareonline.com.au
retirementlivingonline.com.au
realestate.com.au
domain.com.au
any SEO, listing, or advertising site.

After performing the Google Custom Search:
1. If a village-specific page exists on the operator domain that matches {{Village}}, return that exact URL.
2. If no village-specific page exists but the operator homepage matches the domain, return the operator homepage.
3. If no valid result exists on the operator domain, return exactly: "No official website".

Validation:
- If the returned URL does not contain {{Domain}}, replace it with: "Invalid – domain mismatch".
- If the returned URL contains any forbidden domain, replace it with: "Invalid – directory/advertising URL".

Retry rule:
- If the first attempt returns blank, invalid, or mismatched results, retry the Google Custom Search once using the same query.

Overwrite protection:
- If an existing URL already exists for this village AND the new result is invalid, keep the existing URL and do not overwrite it.

Output:
Return ONLY the final URL or "No official website".
No explanation, no commentary, no reasoning.



If you want, I can now generate:
- the one‑block URL validation script
- the one‑block “don’t overwrite existing data” script
- the one‑block “multi‑name village search” script (e.g., “The Heights” vs “Heights Village”)
- or a Make blueprint you can import directly
Just tell me what you want to tighten next.
