Drew, this is exactly the missing piece — and it’s the one thing that makes multi‑site operators (Ryman, Keyton, Levande, RCA, Palm Lake, Lifestyle Communities, etc.) actually work inside Make.
You’re right:
The only reliable way to find village pages for multi‑site operators is to locate the operator’s “Communities / Villages / Locations / Our Villages / Retirement Living” hub page, then search within that page (and its linked pages) for the specific village.
Make cannot crawl reliably, but Google Custom Search can simulate this behaviour perfectly if you give it the right instructions.
So here’s the exact logic you need to give Make so it can handle multi‑site operators correctly.

⭐ THE MULTI‑SITE OPERATOR SOLUTION (PASTE THIS INTO MAKE)
For operators with multiple villages on the same domain, you must locate the operator’s “Communities”, “Villages”, “Locations”, “Our Villages”, “Retirement Living”, or similar hub page. This page usually lists all villages by state.

Use Google Custom Search to find this hub page using the following query:
site:{{Domain}} (communities OR villages OR locations OR "our villages" OR "retirement living")

Once the hub page is identified, search specifically for the village name within the operator domain.

Perform two Google Custom Search queries in order:

Query 1 (primary):
site:{{Domain}} "{{Village}}"

Query 2 (fallback using normalised name):
site:{{Domain}} "{{NormalisedVillageName}}"

Normalise the village name by:
- Removing punctuation
- Removing hyphens
- Removing extra spaces
- Removing trailing words like “Village”, “Retirement Village”, “Community”, “Estate”

STRICT DOMAIN ENFORCEMENT:
- Only return URLs that contain the exact operator domain: {{Domain}}
- Reject all URLs that do NOT contain this domain.

FORBIDDEN DOMAINS (never return these):
villages.com.au
agedcareguide.com.au
agedcareonline.com.au
retirementlivingonline.com.au
realestate.com.au
domain.com.au
any SEO, listing, or advertising site.

VILLAGE MATCHING:
- If multiple villages exist under the same domain, ensure the result matches the exact village name {{Village}} or {{NormalisedVillageName}}.
- Do NOT return a different village under the same operator.

FALLBACK:
- If no village-specific page exists but the operator homepage matches the domain, return the operator homepage.
- If nothing exists on the operator domain, return exactly: "No official website".

NO HALLUCINATIONS:
- Never guess URLs.
- Never construct URLs based on the village name.
- Never assume folder structures like /villages, /locations, /communities, /retirement.
- Never fabricate subpages.

RETRY RULE:
- If the first attempt returns blank, invalid, mismatched, or forbidden results, retry the Google Custom Search once.

OVERWRITE PROTECTION:
- If an existing URL already exists for this village AND the new result is invalid, keep the existing URL and do not overwrite it.

OUTPUT:
Return ONLY the final URL or "No official website".
No explanation, no commentary, no reasoning.



⭐ Why this works for Ryman / Arcadia
Ryman’s structure looks like:
- /retirement-villages/
- /locations/
- /villages/
- /retirement-living/
And each village has its own subpage, but the URL structure is inconsistent.
Make cannot crawl that.
But Google Custom Search can find:
site:rymanhealthcare.com.au "Arcadia"
→ the exact Arcadia village page.
And if that fails:
site:rymanhealthcare.com.au "Arcadia" (normalised)
→ catches variations like “Arcadia Village”, “Arcadia Apartments”, etc.

⭐ If you want, I can also generate:
🔹 A version that handles operators with multiple domains
(e.g., parent domain + retirement domain)
🔹 A version that handles villages with multiple names
(e.g., “The Heights” vs “Heights Village”)
🔹 A version that logs why a URL was rejected
🔹 A version that outputs a confidence score
Just tell me what you want to strengthen next.
