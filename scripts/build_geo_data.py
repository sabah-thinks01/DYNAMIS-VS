import zipfile
import xml.etree.ElementTree as ET
import csv
import json
import re
import os
from collections import defaultdict, Counter

def build_geo_data():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    census_file = os.path.join(base_dir, 'scratch', 'data-raw', 'A-1_NO_OF_VILLAGES_TOWNS_HOUSEHOLDS_POPULATION_AND_AREA.xlsx')
    pincode_file = os.path.join(base_dir, 'scratch', 'data-raw', 'Pincode_30052019.csv')
    alias_file = os.path.join(base_dir, 'src', 'data', 'geo', 'districtAliases.json')
    out_districts_file = os.path.join(base_dir, 'src', 'data', 'geo', 'districts2011.json')
    out_pincodes_file = os.path.join(base_dir, 'src', 'data', 'geo', 'pincodes.json')

    if not os.path.exists(census_file):
        raise FileNotFoundError(f"Census file not found at {census_file}")
    if not os.path.exists(pincode_file):
        raise FileNotFoundError(f"Pincode file not found at {pincode_file}")
    if not os.path.exists(alias_file):
        raise FileNotFoundError(f"Alias file not found at {alias_file}")

    print("================================================================================")
    print("STEP 1: READING CENSUS 2011 A-01 (Python standard library zipfile + xml.etree)")
    print("================================================================================")

    with zipfile.ZipFile(census_file, 'r') as z:
        # Load shared strings
        sst = []
        if 'xl/sharedStrings.xml' in z.namelist():
            sst_tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            namespaces = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for si in sst_tree.findall('ns:si', namespaces):
                t_elems = si.findall('.//ns:t', namespaces)
                sst.append(''.join(t.text or '' for t in t_elems))

        def col_to_idx(col_str):
            idx = 0
            for char in col_str:
                idx = idx * 26 + (ord(char) - ord('A') + 1)
            return idx - 1

        census_rows = []
        with z.open('xl/worksheets/sheet1.xml') as f:
            for event, elem in ET.iterparse(f, events=('end',)):
                if elem.tag.endswith('row'):
                    row_cells = {}
                    for c in elem.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        cell_ref = c.attrib.get('r', '')
                        m = re.match(r'([A-Z]+)(\d+)', cell_ref)
                        if m:
                            col_letters, _ = m.groups()
                            col_idx = col_to_idx(col_letters)
                            t = c.attrib.get('t')
                            v_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                            val = ''
                            if v_elem is not None and v_elem.text is not None:
                                if t == 's':
                                    val = sst[int(v_elem.text)]
                                else:
                                    val = v_elem.text
                            elif t == 'inlineStr':
                                t_elem = c.find('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                                if t_elem is not None and t_elem.text:
                                    val = t_elem.text
                            row_cells[col_idx] = val
                    max_col = max(row_cells.keys()) if row_cells else -1
                    census_rows.append([row_cells.get(i, '') for i in range(max_col + 1)])
                    elem.clear()

    print(f"Loaded {len(census_rows)} total rows from Census spreadsheet.")

    # Target state names mapping
    state_names = {'27': 'Maharashtra', '33': 'Tamil Nadu', '07': 'NCT of Delhi'}

    # Collect district rows for states 27, 33, 07
    cleaned_district_names_log = []
    census_districts = {} # districtKey -> dict
    census_by_name = {} # (stateCode, clean_name_upper) -> districtKey

    for r in census_rows:
        if len(r) > 13 and r[0] in state_names and r[3] == 'DISTRICT' and r[2] == '00000':
            state_code = r[0]
            dist_code = r[1]
            dist_key = f"{state_code}-{dist_code}"
            raw_name = r[4]
            # Clean name rule: strip trailing footnote markers and whitespace (# @ & $ * and spaces)
            clean_name = re.sub(r'[\s#@&$*]+$', '', raw_name).strip()

            if raw_name != clean_name and (raw_name, clean_name) not in [(x[1], x[2]) for x in cleaned_district_names_log]:
                cleaned_district_names_log.append((state_code, raw_name, clean_name))

            tru = r[5].strip()
            if dist_key not in census_districts:
                census_districts[dist_key] = {
                    'stateCode': state_code,
                    'stateName': state_names[state_code],
                    'districtCode': dist_code,
                    'name': clean_name,
                    'populationTotal': 0,
                    'areaTotalSqKm': 0.0,
                    'populationRural': 0,
                    'areaRuralSqKm': 0.0
                }
                census_by_name[(state_code, clean_name.upper())] = dist_key

            if tru == 'Total':
                census_districts[dist_key]['populationTotal'] = int(float(r[10])) if r[10] else 0
                census_districts[dist_key]['areaTotalSqKm'] = float(r[13]) if r[13] else 0.0
            elif tru == 'Rural':
                census_districts[dist_key]['populationRural'] = int(float(r[10])) if r[10] else 0
                census_districts[dist_key]['areaRuralSqKm'] = float(r[13]) if r[13] else 0.0

    print("\nDistrict names cleaned (raw -> cleaned):")
    for st_c, raw_n, clean_n in sorted(cleaned_district_names_log):
        print(f"  [{state_names[st_c]}] '{raw_n}' -> '{clean_n}'")

    # Compute density
    districts_2011_data = {}
    for dist_key, d in sorted(census_districts.items()):
        pop_rural = d['populationRural']
        area_rural = d['areaRuralSqKm']
        pop_total = d['populationTotal']
        area_total = d['areaTotalSqKm']

        if pop_rural > 0 and area_rural >= 0.5 * area_total:
            basis = 'rural'
            density = round(pop_rural / area_rural, 1)
        else:
            basis = 'total'
            density = round(pop_total / area_total, 1) if area_total > 0 else 0.0

        districts_2011_data[dist_key] = {
            'stateCode': d['stateCode'],
            'stateName': d['stateName'],
            'districtCode': d['districtCode'],
            'name': d['name'],
            'populationTotal': pop_total,
            'areaTotalSqKm': area_total,
            'populationRural': pop_rural,
            'areaRuralSqKm': area_rural,
            'densityPerSqKm': density,
            'densityBasis': basis
        }

    # Write minified districts2011.json
    with open(out_districts_file, 'w', encoding='utf-8') as f:
        json.dump(districts_2011_data, f, separators=(',', ':'))

    dist_size = os.path.getsize(out_districts_file)
    print(f"\nWritten {len(districts_2011_data)} districts to {out_districts_file} ({dist_size} bytes, {dist_size/1024:.2f} KB).")

    print("\n================================================================================")
    print("STEP 2: LOADING ALIASES & PARSING INDIA POST PINCODE CSV")
    print("================================================================================")

    with open(alias_file, 'r', encoding='utf-8') as f:
        aliases_list = json.load(f)

    # State map from CSV string to stateCode
    csv_state_map = {
        'maharashtra': '27',
        'tamil nadu': '33',
        'delhi': '07'
    }

    # Alias lookup: (stateCode, postal_upper) -> alias dict
    alias_map = {}
    for a in aliases_list:
        st_clean = a['state'].strip().lower()
        if st_clean in csv_state_map:
            st_code = csv_state_map[st_clean]
            alias_map[(st_code, a['postal'].strip().upper())] = a

    ignored_districts = {'DARBHANGA', 'JHAJJAR', 'SIDDHARTHNAGAR', 'NA', 'KARAIKAL', 'PONDICHERRY'}

    with open(pincode_file, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        headers = next(reader)
        p_rows = list(reader)

    # Group rows by pincode
    pincode_groups = defaultdict(list)
    for r in p_rows:
        if len(r) > 8:
            st_clean = r[8].strip().lower()
            if st_clean in csv_state_map:
                st_code = csv_state_map[st_clean]
                postal_dist = r[7].strip().upper()
                pin = r[4].strip()

                if postal_dist in ignored_districts:
                    continue

                pincode_groups[pin].append({
                    'stateCode': st_code,
                    'postalDistrict': postal_dist,
                    'officeName': r[3].strip()
                })

    print(f"Total distinct pincodes to map across 3 states: {len(pincode_groups)}")

    mapped_pincodes = {}
    stats_by_state = defaultdict(lambda: Counter())
    ambiguous_by_state = defaultdict(int)
    unmatched_postal_districts = defaultdict(set)

    for pin, po_rows in sorted(pincode_groups.items()):
        district_votes = Counter()
        vote_meta = {} # dist_key -> list of (postal_dist, mappedVia, stateCode)

        for row in po_rows:
            st_code = row['stateCode']
            p_dist = row['postalDistrict']

            # Direct match
            if (st_code, p_dist) in census_by_name:
                d_key = census_by_name[(st_code, p_dist)]
                district_votes[d_key] += 1
                if d_key not in vote_meta:
                    vote_meta[d_key] = []
                vote_meta[d_key].append((p_dist, 'direct', st_code))
            # Alias match
            elif (st_code, p_dist) in alias_map:
                alias = alias_map[(st_code, p_dist)]
                c_target = alias['census2011'].strip().upper()
                if (st_code, c_target) in census_by_name:
                    d_key = census_by_name[(st_code, c_target)]
                    district_votes[d_key] += 1
                    if d_key not in vote_meta:
                        vote_meta[d_key] = []
                    vote_meta[d_key].append((p_dist, alias['kind'], st_code))
                else:
                    unmatched_postal_districts[st_code].add(p_dist)
            else:
                unmatched_postal_districts[st_code].add(p_dist)

        if not district_votes:
            continue

        # Winning district by plurality vote
        # To break ties deterministically, sort by vote count desc, then districtKey asc
        sorted_candidates = sorted(district_votes.items(), key=lambda x: (-x[1], x[0]))
        winning_dist_key, winning_count = sorted_candidates[0]

        is_ambiguous = len(district_votes) > 1

        # Most common postal district among winning rows
        winning_po_metas = vote_meta[winning_dist_key]
        postal_counter = Counter(m[0] for m in winning_po_metas)
        chosen_postal_dist = postal_counter.most_common(1)[0][0]

        matching_metas = [m for m in winning_po_metas if m[0] == chosen_postal_dist]
        chosen_via = matching_metas[0][1]
        st_code = matching_metas[0][2]

        entry = {
            'districtKey': winning_dist_key,
            'postalDistrict': chosen_postal_dist,
            'mappedVia': chosen_via
        }
        if is_ambiguous:
            entry['ambiguous'] = True
            ambiguous_by_state[st_code] += 1

        mapped_pincodes[pin] = entry
        stats_by_state[st_code][chosen_via] += 1

    # Write minified pincodes.json
    with open(out_pincodes_file, 'w', encoding='utf-8') as f:
        json.dump(mapped_pincodes, f, separators=(',', ':'))

    pin_size = os.path.getsize(out_pincodes_file)
    print(f"\nWritten {len(mapped_pincodes)} pincodes to {out_pincodes_file} ({pin_size} bytes, {pin_size/1024:.2f} KB).")

    print("\n================================================================================")
    print("STEP 3: MAPPING VERIFICATION SUMMARY")
    print("================================================================================")
    for st, st_name in [('27', 'Maharashtra'), ('33', 'Tamil Nadu'), ('07', 'NCT of Delhi')]:
        print(f"\nState: {st_name} (Code {st})")
        print(f"  Mapped via breakdown:")
        for kind in ['direct', 'spelling', 'typo', 'postalDivision', 'newDistrict']:
            cnt = stats_by_state[st].get(kind, 0)
            print(f"    - {kind:<15}: {cnt:>5}")
        total_st = sum(stats_by_state[st].values())
        print(f"    - TOTAL          : {total_st:>5}")
        print(f"  Ambiguous pincodes : {ambiguous_by_state[st]:>5}")
        unmatched_list = sorted(list(unmatched_postal_districts[st]))
        print(f"  Unmatched postal districts: {unmatched_list if unmatched_list else 'None'}")

if __name__ == '__main__':
    build_geo_data()
