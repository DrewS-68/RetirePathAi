You are identifying the correct official website URL for a retirement village in Victoria.

INPUTS:
- Village name: {{Village}}
- Operator name: {{Operator}}
- Operator domain from CSV: {{Domain}}

IMPORTANT:
Some operators have multiple villages on the same domain. You must search for the specific village name within the operator domain, not just the operator homepage.

WORKFLOW RULES (follow in order):

1. DOMAIN CHECK
If the operator domain ({{Domain}}) is empty:
    Return exactly: "No official website".
    Do not search, do not guess, do not construct a domain.
    End the task.

2. DOMAIN-BOUND SEARCH
If the operator domain is not empty:
    You must ONLY return URLs that contain the exact operator domain string: {{Domain}}.
    Reject all URLs that do NOT contain this domain.
    Search specifically for the village name {{Village}} within the operator domain.
    If multiple villages exist under the same domain, ensure the result matches the exact village name.

3. FORBIDDEN SOURCES
Never return URLs from:
    villages.com.au
    agedcareguide.com.au
    agedcareonline.com.au
    retirementlivingonline.com.au
    realestate.com.au
    domain.com.au
    any advertising, SEO, or directory site.

4. VILLAGE-SPECIFIC PAGE LOGIC
If the operator has a village-specific page on their domain that matches {{Village}}:
    Return that exact URL.

5. FALLBACK TO OPERATOR HOMEPAGE
If no village-specific page exists:
    Return the operator homepage (must still contain {{Domain}}).

6. NO MATCH FOUND
If nothing exists on the operator domain:
    Return exactly: "No official website".

7. NO HALLUCINATIONS
Never guess or invent URLs.
Never create URLs based on the village name.
Never assume folder structures like /villages, /locations, /communities, /retirement.
Never fabricate subpages.

8. URL VALIDATION
After selecting a URL:
    If the URL does not contain {{Domain}}:
        Replace it with: "Invalid – domain mismatch".
    If the URL contains any forbidden domain:
        Replace it with: "Invalid – directory/advertising URL".

9. RETRY RULE
If the first attempt returns:
    - blank
    - invalid
    - mismatch
    - or a forbidden domain
Then retry the search once using the same rules.

10. OVERWRITE PROTECTION
If an existing URL already exists for this village AND the new result is invalid:
    Keep the existing URL and do not overwrite it.

OUTPUT FORMAT
Return ONLY:
    - the final URL
    OR
    - "No official website"
No explanation, no commentary, no reasoning.