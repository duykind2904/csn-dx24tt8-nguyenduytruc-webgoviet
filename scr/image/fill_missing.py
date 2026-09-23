import os, json, re, time, urllib.request, urllib.parse, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

IMAGE_DIR = os.path.dirname(os.path.abspath(__file__))
H = {'User-Agent': 'Mozilla/5.0 (compatible; WikiBot/1.0)'}

# Multiple search queries per slug, tried in order
MISSING = {
    "danang":    ["Dragon Bridge Danang", "My Khe beach Da Nang", "Han River Da Nang", "Ngu Hanh Son Da Nang"],
    "dalat":     ["Dalat city Vietnam", "Xuan Huong Lake Dalat", "Lam Dong plateau Vietnam", "Elephant waterfall Dalat"],
    "hagiang":   ["Ha Giang buckwheat flower", "Dong Van Ha Giang Vietnam", "Lung Cu flagpole Ha Giang", "Meo Vac Ha Giang"],
    "condao":    ["Con Son island Vietnam", "Con Dao archipelago", "Poulo Condore island Vietnam", "Con Dao national park turtle"],
    "hochiminh": ["Saigon Vietnam city", "Ben Thanh market Saigon", "Notre Dame Cathedral Saigon", "Reunification Palace Saigon"],
    "cantho":    ["Cai Rang floating market Can Tho", "Ninh Kieu wharf Can Tho", "Mekong Delta river Vietnam", "Can Tho bridge"],
    "banahill":  ["Ba Na Hills resort Da Nang", "Golden Bridge Ba Na", "Fantasy Park Da Nang", "Ba Na funicular"],
    "muine":     ["Mui Ne sand dunes", "Red sand dunes Phan Thiet", "Fairy stream Mui Ne", "Mui Ne fishing village"],
    "nhatrang":  ["Nha Trang beach Vietnam", "Hon Mun island snorkeling", "Po Nagar towers Nha Trang", "Vinpearl cable car Nha Trang"],
}

SKIP = ['stub','icon','logo','commons-','wikidata','pictogram','location_map',
        'wikisource','blank_','crystal_','nuvola','padlock','disambig',
        'sound-','globe_','navigation','arrow_','button_','.svg','.png','.gif',
        'cquote','flag_of','coat_of_arms','wikivoyage','wiktionary','wikipedia_logo']

def is_skip(name):
    n = name.lower()
    return any(s in n for s in SKIP)

def fetch_json(url, retries=5):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=H)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 10 + i * 5
                print(f"    429 rate limit, sleep {wait}s...")
                time.sleep(wait)
            else:
                return None
        except Exception:
            time.sleep(3)
    return None

def search_commons(query, limit=20):
    q = urllib.parse.quote(query)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch={q}&srlimit={limit}&format=json'
    data = fetch_json(url)
    if not data: return []
    files = []
    for item in data.get('query', {}).get('search', []):
        t = item.get('title', '').replace('File:', '')
        if re.search(r'\.(jpe?g)$', t, re.I) and not is_skip(t):
            files.append(t)
    return files

def get_url(filename, width=800):
    encoded = urllib.parse.quote(filename)
    url = f'https://commons.wikimedia.org/w/api.php?action=query&titles=File:{encoded}&prop=imageinfo&iiprop=url|size&iiurlwidth={width}&format=json'
    data = fetch_json(url)
    if not data: return ''
    for p in data.get('query', {}).get('pages', {}).values():
        info = p.get('imageinfo', [])
        if info:
            if info[0].get('width', 0) < 300:
                return ''
            t = info[0].get('thumburl', '')
            if t:
                return t.replace('thumb.wikimedia.org', 'upload.wikimedia.org').split('?')[0]
    return ''

def download(url, path):
    if not url: return False
    try:
        req = urllib.request.Request(url, headers=H)
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        if len(data) < 8000: return False
        with open(path, 'wb') as f: f.write(data)
        return True
    except:
        return False

for slug, queries in MISSING.items():
    existing = len([f for f in os.listdir(IMAGE_DIR) if re.match(rf'^{slug}\d+\.jpg$', f)])
    if existing >= 4:
        print(f"[ok] {slug}: {existing} images")
        continue

    print(f"\n>>> {slug} (have {existing}/4)")
    done = existing
    used_files = set()

    for query in queries:
        if done >= 4: break
        print(f"  search: {query}")
        files = search_commons(query, 25)
        time.sleep(1.5)
        print(f"  found {len(files)} candidates")

        for fname in files:
            if done >= 4: break
            if fname in used_files: continue
            used_files.add(fname)

            n = done + 1
            out = os.path.join(IMAGE_DIR, f'{slug}{n}.jpg')
            if os.path.exists(out):
                done += 1
                continue

            url = get_url(fname)
            time.sleep(0.8)
            if not url: continue

            if download(url, out):
                kb = os.path.getsize(out) // 1024
                print(f"  [{n}] {fname[:45]} ({kb}KB)")
                done += 1
            time.sleep(0.5)

    print(f"  => {done}/4 for {slug}")

print("\n=== SUMMARY ===")
all_slugs = list(MISSING.keys())
all_slugs += ["sapa","hoian","hue","phongnha","phuquoc","hanoi","ninhbinh","myson","vungtau","bangioc","vinhhalong"]
for slug in sorted(all_slugs):
    count = len([f for f in os.listdir(IMAGE_DIR) if re.match(rf'^{slug}\d+\.jpg$', f)])
    print(f"  {slug}: {count}/4 {'OK' if count >= 4 else 'MISSING'}")
