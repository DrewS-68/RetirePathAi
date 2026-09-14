// HTML extraction utilities for web scraping
// Extracts structured data from HTML before converting to plain text

export function extractImages(html: string, baseUrl: string): string[] {
  const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  const extractedImages: string[] = [];
  
  for (const match of imgMatches) {
    let imgUrl = match[1];
    
    // Skip tiny images, icons, logos, tracking pixels
    if (imgUrl.includes('logo') || imgUrl.includes('icon') || imgUrl.includes('avatar') || 
        imgUrl.includes('1x1') || imgUrl.includes('spacer') || imgUrl.includes('pixel') ||
        imgUrl.includes('tracking') || imgUrl.includes('analytics')) {
      continue;
    }
    
    // Make absolute URLs
    try {
      if (imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (imgUrl.startsWith('/')) {
        imgUrl = new URL(baseUrl).origin + imgUrl;
      } else if (!imgUrl.startsWith('http')) {
        imgUrl = new URL(imgUrl, baseUrl).href;
      }
      
      extractedImages.push(imgUrl);
    } catch (e) {
      // Skip invalid URLs
      console.log(`  ⚠️ Skipping invalid image URL: ${imgUrl}`);
    }
  }
  
  return extractedImages;
}

export function extractListItems(html: string): string[] {
  const listItemMatches = html.matchAll(/<li[^>]*>(.*?)<\/li>/gi);
  const listItems: string[] = [];
  
  for (const match of listItemMatches) {
    const text = match[1]
      .replace(/<[^>]+>/g, ' ')  // Strip inner tags
      .replace(/&nbsp;/g, ' ')    // Replace nbsp
      .replace(/&amp;/g, '&')     // Replace HTML entities
      .trim()
      .toLowerCase();
    
    if (text.length > 3 && text.length < 150) { // Filter reasonable amenity text
      listItems.push(text);
    }
  }
  
  return listItems;
}

export function findPricingPDF(html: string): string | null {
  // Look for PDF links that might contain pricing information
  const patterns = [
    /<a[^>]+href=["']([^"']*pricing[^"']*\.pdf)["'][^>]*>/i,
    /<a[^>]+href=["']([^"']*price[^"']*\.pdf)["'][^>]*>/i,
    /<a[^>]+href=["']([^"']*fees?[^"']*\.pdf)["'][^>]*>/i,
    /<a[^>]+href=["']([^"']*cost[^"']*\.pdf)["'][^>]*>/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

export function extractJSONLD(html: string): any[] {
  const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const structuredData: any[] = [];
  
  for (const match of jsonLdMatches) {
    try {
      const jsonText = match[1].trim();
      const data = JSON.parse(jsonText);
      structuredData.push(data);
    } catch (e) {
      // Skip invalid JSON-LD
    }
  }
  
  return structuredData;
}
