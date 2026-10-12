# DYNAMIS Geographic & Demographic Data (Census 2011)

This directory contains pre-processed geographic, administrative, and demographic reference data for DYNAMIS pilot states.

## Pilot Scope
- **Maharashtra** (State Code: `27`)
- **Tamil Nadu** (State Code: `33`)
- **NCT of Delhi** (State Code: `07`)

---

## Data Sources

1. **Census of India 2011 — Table A-01**
   - **Full Title:** *A-01: Number of villages, towns, households, population and area (India, states/UTs, districts and Sub-districts) - 2011*
   - **Catalog ID:** `42526` (ORGI NADA Catalog, `PC11_A01`)
   - **Source URL:** `https://censusindia.gov.in/nada/index.php/catalog/42526`
   - **Direct Download URL:** `https://censusindia.gov.in/nada/index.php/catalog/42526/download/46152/A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx`
   - **Download Date:** October 2026

2. **India Post — All India Pincode Directory**
   - **Source Portal:** Open Government Data (OGD) Platform India (`data.gov.in`)
   - **Catalog ID:** `dataurl31052019`
   - **Direct Download URL:** `https://data.gov.in/sites/default/files/dataurl31052019/Pincode_30052019.csv`
   - **Download Date:** October 2026

---

## File Inventory

- `districts2011.json`: Minified JSON dictionary of 2011 Census districts for the pilot states, keyed by `"<stateCode>-<districtCode>"` (e.g., `"27-521"` for Pune). Contains total and rural population and area in sq km, along with computed density.
- `pincodes.json`: Minified JSON dictionary mapping 6-digit postal pincodes in pilot states to their primary 2011 Census district key, postal district name, mapping provenance (`mappedVia`), and an ambiguity flag if post offices span multiple districts.
- `districtAliases.json`: Human-readable mapping configuration that bridges differences between India Post district names and official 2011 Census district designations.

---

## Density Computation Rule

For each district in `districts2011.json`:
- If `populationRural > 0` AND `areaRuralSqKm >= 0.5 * areaTotalSqKm` (rural land is at least half the district):
  - `densityBasis`: `"rural"`
  - `densityPerSqKm`: `round(populationRural / areaRuralSqKm, 1)`
- Otherwise:
  - `densityBasis`: `"total"`
  - `densityPerSqKm`: `round(populationTotal / areaTotalSqKm, 1)`

Rural density is used only if rural land is at least half the district so that mostly-urban districts with a small rural pocket are not described by an unrepresentative rural density.

---

## District Aliases (`districtAliases.json`)

Post-office records frequently use informal spellings, postal administrative division names, or references to districts bifurcated after the 2011 Census. The alias file specifies:
- `spelling`: Official spelling variations (e.g. `AHMED NAGAR` → `Ahmadnagar`, `BEED` → `Bid`, `KANCHIPURAM` → `Kancheepuram`, `CENTRAL DELHI` → `Central`).
- `typo`: Postal directory typographical errors (e.g. `JALGOAN` → `Jalgaon`, `MUMBAI SUBUEBAN` → `Mumbai Suburban`).
- `postalDivision`: Postal delivery divisions designated as districts by India Post (e.g. `MALEGAON` → `Nashik`, `MIRAJ` → `Sangli`, `BHUSAWAL` → `Jalgaon`, `SHRIRAMPUR` → `Ahmadnagar`).
- `newDistrict`: Districts established after the 2011 Census (e.g. `PALGHAR` created in 2014 mapped to parent `Thane`; `SHAHDARA` created in 2012 mapped to `East` Delhi approximation).

---

## How to Rebuild

Raw source files are kept in `scratch/data-raw/` (gitignored) and are not tracked in the repository.

1. Ensure the raw files are present under `scratch/data-raw/`:
   - `scratch/data-raw/A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx`
   - `scratch/data-raw/Pincode_30052019.csv`
2. Run the conversion script (requires Python 3 standard library only; no `openpyxl` or external dependencies required):
   ```bash
   py scripts/build_geo_data.py
   ```
3. The script will rebuild and minify `districts2011.json` and `pincodes.json`.
