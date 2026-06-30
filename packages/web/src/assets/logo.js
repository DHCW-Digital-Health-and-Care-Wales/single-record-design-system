/**
 * Placeholder brand marks for the DHCW Single Record programme.
 *
 * IMPORTANT: these are NEUTRAL PLACEHOLDERS, not the official NHS / GIG
 * trademark lockups (Figma Logos set 270:2850). The real logos are
 * trademarked, raster-backed assets and must be exported from Figma and
 * committed to the repo, then swapped in here. Header and Navigation accept
 * the logo as an element/prop, so swapping is a one-line change per consumer.
 *
 *   logoSymbolSrc — compact square mark (mobile header, collapsed states)
 *   logoFullSrc   — symbol + wordmark lockup (desktop header, expanded nav)
 */

const symbol =
  '<rect width="40" height="40" rx="8" fill="#325083"/>' +
  '<polygon points="20,8 32,20 20,32 8,20" fill="none" stroke="#ffffff" stroke-width="2.5"/>' +
  '<polygon points="20,15 25,20 20,25 15,20" fill="#ffffff"/>';

export const logoSymbolSrc =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${symbol}</svg>`
  );

export const logoFullSrc =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="184" height="40" viewBox="0 0 184 40">' +
      symbol +
      '<text x="52" y="18" font-family="Roboto, system-ui, sans-serif" font-size="16" font-weight="700" fill="#325083">DHCW</text>' +
      '<text x="52" y="33" font-family="Roboto, system-ui, sans-serif" font-size="13" fill="#4c5a6e">Single Record</text>' +
      '</svg>'
  );
