# NHS Wales Data Dictionary: source snapshot

Plain-text copies of the NHS Wales Data Dictionary pages behind the content rules for patient
identity, demographics, contact details and GP. Every rule we write about how demo content and
UI copy present these items must cite one of these files, or a DSCN in `../dscn/`.

| | |
|---|---|
| Source | https://www.datadictionary.wales.nhs.uk/ (v4.25, released 3 June 2025) |
| DSCNs | https://dhcw.nhs.wales/ (Data Standards Change Notices); text copies in `../dscn/` |
| Retrieved | 2026-10-30 |
| Refresh | `node scripts/fetch-data-dictionary.mjs`, then review the git diff |

v4.25 is the last version on this website. DHCW is moving the dictionary to a new platform and
publishes changes as DSCNs on dhcw.nhs.wales until then (contact: data.standards@wales.nhs.uk).
Check for DSCNs issued after June 2025 before relying on a rule.

`dscn-links.txt` lists every DSCN the fetched pages cite. Only the ones about identity,
demographics, addresses and GP are copied as text into `../dscn/`.

These files are copies of DHCW publications for traceability. They are not ours to edit; if one
is wrong, refresh it from the source.
