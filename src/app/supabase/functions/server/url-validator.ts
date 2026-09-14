/**
 * URL Validation System for Retirement Villages
 * Validates that a found URL actually belongs to the specific village
 */

/**
 * Validate that a URL actually belongs to a specific village
 * Returns confidence score: 0-100
 */
export async function validateVillageUrl(
  url: string,
  villageName: string,
  operator: string | null,
  suburb: string | null,
  scraperApiKey: string
): Promise<{
  isValid: boolean;
  confidence: number;
  reasons: string[];
  warnings: string[];
}> {
  const reasons: string[] = [];
  const warnings: string[] = [];
  let confidence = 0;

  try {
    console.log(`🔍 VALIDATING URL: ${url}`);
    console.log(`   Village: ${villageName}`);
    console.log(`   Operator: ${operator || 'N/A'}`);
    console.log(`   Suburb: ${suburb || 'N/A'}`);

    // ========================================
    // VALIDATION 0: Check domain is Australian (.com.au / .org.au / .net.au)
    // ========================================
    const urlLower = url.toLowerCase();
    const isAustralianDomain = urlLower.includes('.com.au') || 
                               urlLower.includes('.org.au') || 
                               urlLower.includes('.net.au') ||
                               urlLower.includes('.gov.au') ||
                               urlLower.includes('.edu.au');
    
    if (!isAustralianDomain) {
      console.log(`   ❌ NON-AUSTRALIAN DOMAIN DETECTED: ${url}`);
      warnings.push(`❌ Not an Australian domain (must end with .com.au, .org.au, etc.)`);
      // Instant rejection for non-AU domains
      return {
        isValid: false,
        confidence: 0,
        reasons: [],
        warnings: [...warnings, '❌ URL rejected: Not an Australian domain']
      };
    } else {
      confidence += 10;
      reasons.push(`✅ Australian domain (.com.au/.org.au)`);
    }

    // ========================================
    // VALIDATION 1: Check domain matches operator
    // ========================================
    if (operator) {
      const operatorSlug = operator.toLowerCase().replace(/[^a-z0-9]/g, '');
      const urlSlug = url.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if operator name appears in the domain
      if (urlSlug.includes(operatorSlug)) {
        confidence += 40;
        reasons.push(`✅ Domain matches operator "${operator}"`);
      } else {
        warnings.push(`⚠️ Domain does NOT match operator "${operator}"`);
      }
    }

    // ========================================
    // VALIDATION 2: Fetch page and check content
    // ========================================
    console.log(`   📥 Fetching page content...`);
    
    const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(url)}`;
    
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    // Retry logic for timeout errors
    while (retryCount <= maxRetries) {
      try {
        response = await fetch(scraperUrl, {
          signal: AbortSignal.timeout(60000) // Increased from 30s to 60s
        });
        
        if (response.ok) {
          break; // Success!
        }
        
        console.log(`   ⚠️ Fetch failed: ${response.status}, retry ${retryCount + 1}/${maxRetries}`);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s before retry
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'TimeoutError' || fetchError.message?.includes('timed out')) {
          console.log(`   ⏱️  Validation timeout on attempt ${retryCount + 1}/${maxRetries + 1}`);
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.log(`   🔄 Waiting 10 seconds before retry...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
          } else {
            warnings.push(`⚠️ Page validation timed out after 3 attempts`);
            console.log(`   ❌ Validation timed out after 3 attempts`);
            // Can't validate content, use domain-based confidence only
            return {
              isValid: confidence >= 30,
              confidence,
              reasons,
              warnings: [...warnings, '⚠️ Could not validate page content (timeout)']
            };
          }
        } else {
          throw fetchError; // Re-throw non-timeout errors
        }
      }
    }

    if (!response || !response.ok) {
      warnings.push(`⚠️ Failed to fetch page: ${response?.status}`);
      console.log(`   ❌ Failed to fetch page: ${response?.status}`);
      // If we can't fetch the page, we can't validate content
      // But we can still use domain-based confidence
      return {
        isValid: confidence >= 30, // Lower threshold if we can't fetch content
        confidence,
        reasons,
        warnings: [...warnings, '⚠️ Could not validate page content']
      };
    }

    const html = await response.text();
    const htmlLower = html.toLowerCase();

    // ========================================
    // VALIDATION 3: Check village name appears on page
    // ========================================
    const villageNameParts = villageName.toLowerCase()
      .replace(/retirement village/gi, '')
      .replace(/aged care/gi, '')
      .trim()
      .split(/\s+/);

    // Check if ALL major words from village name appear on page
    const missingWords: string[] = [];
    let foundWords = 0;

    for (const word of villageNameParts) {
      // Skip very short words (like "the", "at", etc.)
      if (word.length <= 2) continue;

      if (htmlLower.includes(word.toLowerCase())) {
        foundWords++;
      } else {
        missingWords.push(word);
      }
    }

    const significantWords = villageNameParts.filter(w => w.length > 2);
    const matchPercentage = significantWords.length > 0 
      ? (foundWords / significantWords.length) * 100 
      : 0;

    if (matchPercentage >= 80) {
      confidence += 40;
      reasons.push(`✅ Village name found on page (${Math.round(matchPercentage)}% match)`);
    } else if (matchPercentage >= 50) {
      confidence += 20;
      warnings.push(`⚠️ Partial village name match (${Math.round(matchPercentage)}%)`);
      if (missingWords.length > 0) {
        warnings.push(`   Missing words: ${missingWords.join(', ')}`);
      }
    } else {
      warnings.push(`❌ Village name NOT found on page (only ${Math.round(matchPercentage)}% match)`);
      if (missingWords.length > 0) {
        warnings.push(`   Missing words: ${missingWords.join(', ')}`);
      }
    }

    // ========================================
    // VALIDATION 4: Check suburb appears on page
    // ========================================
    if (suburb) {
      if (htmlLower.includes(suburb.toLowerCase())) {
        confidence += 10;
        reasons.push(`✅ Suburb "${suburb}" found on page`);
      } else {
        warnings.push(`⚠️ Suburb "${suburb}" NOT found on page`);
      }
    }

    // ========================================
    // VALIDATION 5: Check operator appears on page
    // ========================================
    if (operator) {
      if (htmlLower.includes(operator.toLowerCase())) {
        confidence += 10;
        reasons.push(`✅ Operator "${operator}" found on page`);
      } else {
        warnings.push(`⚠️ Operator "${operator}" NOT found on page`);
      }
    }

    // ========================================
    // FINAL ASSESSMENT
    // ========================================
    console.log(`   🎯 CONFIDENCE: ${confidence}%`);
    console.log(`   ✅ Reasons:`, reasons);
    if (warnings.length > 0) {
      console.log(`   ⚠️ Warnings:`, warnings);
    }

    // URL is valid if confidence >= 50%
    const isValid = confidence >= 50;

    return {
      isValid,
      confidence,
      reasons,
      warnings
    };

  } catch (error: any) {
    console.error(`❌ Error validating URL:`, error.message);
    return {
      isValid: false,
      confidence: 0,
      reasons: [],
      warnings: [`❌ Validation error: ${error.message}`]
    };
  }
}

/**
 * Known operator domains for quick validation
 * Format: { operator: 'Operator Name', domains: ['domain1.com', 'domain2.com'] }
 */
export const KNOWN_OPERATOR_DOMAINS = [
  { operator: 'Aveo', domains: ['aveo.com.au'] },
  { operator: 'Lendlease', domains: ['lendlease.com', 'lendleaseretirementliving.com.au'] },
  { operator: 'Stockland', domains: ['stockland.com.au'] },
  { operator: 'Keyton', domains: ['keyton.com.au'] },
  { operator: 'Australian Unity', domains: ['australianunity.com.au'] },
  { operator: 'Lifestyle Communities', domains: ['lifestylecommunities.com.au'] },
  { operator: 'Anglicare', domains: ['anglicare.com.au', 'anglicarevic.org.au'] },
  { operator: 'Uniting AgeWell', domains: ['unitingagewell.org'] },
  { operator: 'Baptcare', domains: ['baptcare.org.au'] },
  { operator: 'Bethanie', domains: ['bethanie.com.au'] },
  { operator: 'Blue Care', domains: ['bluecare.org.au'] },
  { operator: 'Regis', domains: ['regis.com.au'] },
  { operator: 'Ryman Healthcare', domains: ['rymanhealthcare.com.au', 'rymanhealthcare.co.nz'] },
];

/**
 * Check if a URL domain matches a known operator
 */
export function getOperatorFromDomain(url: string): string | null {
  const urlLower = url.toLowerCase();
  
  for (const { operator, domains } of KNOWN_OPERATOR_DOMAINS) {
    for (const domain of domains) {
      if (urlLower.includes(domain)) {
        return operator;
      }
    }
  }
  
  return null;
}

/**
 * Detect if a URL is likely a mis-match
 * Returns true if the URL appears to belong to a DIFFERENT operator
 */
export function detectOperatorMismatch(url: string, expectedOperator: string | null): {
  isMismatch: boolean;
  foundOperator: string | null;
  reason: string;
} {
  if (!expectedOperator) {
    return { isMismatch: false, foundOperator: null, reason: 'No expected operator to compare' };
  }

  const detectedOperator = getOperatorFromDomain(url);
  
  if (!detectedOperator) {
    return { isMismatch: false, foundOperator: null, reason: 'Could not detect operator from domain' };
  }

  const expectedNormalized = expectedOperator.toLowerCase().replace(/[^a-z0-9]/g, '');
  const detectedNormalized = detectedOperator.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (expectedNormalized !== detectedNormalized) {
    return {
      isMismatch: true,
      foundOperator: detectedOperator,
      reason: `URL belongs to "${detectedOperator}" but village operator is "${expectedOperator}"`
    };
  }

  return { isMismatch: false, foundOperator: detectedOperator, reason: 'Operator matches' };
}