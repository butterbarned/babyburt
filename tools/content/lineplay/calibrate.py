"""
Sizes for the LINE PLAY pack, from the Resortopia pack's (whose sizes were set by eye in a den).

    python tools/content/lineplay/calibrate.py [--viewer D:/lineplay_viewer] [--resortopia content-packs/resortopia]
                                                [--per 120] [--write]

For every category chip both packs have, it compares the typical item size (the median of
sqrt(width x height), floor/wall/rug kept apart) of Resortopia's finished pictures with LINE PLAY's
pictures at 100%. allScale becomes the median of those ratios. Per-category scales are only written
with --per-category: LINE PLAY's own items are already the right size for each other, and most
category differences are about what is in them (LINE PLAY "food" is small dishes, Resortopia's is
feasts and stalls; LINE PLAY rugs include whole-room carpets), not about scale. LINE PLAY's sofas are in "seating", so they are compared with
Resortopia's seating and sofas together. --write puts the result in category_map.json (the preview's
"try a size" can fine-tune it afterwards).
"""
import argparse, base64, collections, io, json, math, os, random, statistics, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ap = argparse.ArgumentParser()
ap.add_argument('--viewer', default=r'D:\lineplay_viewer')
ap.add_argument('--resortopia', default=os.path.join(ROOT, 'content-packs', 'resortopia'))
ap.add_argument('--per', type=int, default=120, help='LINE PLAY items measured per category')
ap.add_argument('--write', action='store_true')
ap.add_argument('--per-category', action='store_true')
A = ap.parse_args()
sys.path.insert(0, os.path.join(A.viewer, 'tools'))
import lprender

cmap_path = os.path.join(HERE, 'category_map.json')
cmap = json.load(open(cmap_path, encoding='utf8'))
SAME = {'seating': ('seating', 'sofas')}

# Resortopia: finished sizes, by chip and placement
res = collections.defaultdict(list)
for it in json.load(open(os.path.join(A.resortopia, 'pack.json'), encoding='utf8'))['items']:
    if not it.get('structural'):
        res[(it['category'], it['placement'])].append(math.sqrt(it['width'] * it['height']))

# LINE PLAY: a sample of each chip, drawn at 100% the way convert.py draws them
man = open(os.path.join(A.viewer, 'data', 'manifest.js'), encoding='utf-8').read()
M = json.loads(man[man.index('(') + 1: man.rindex(')')])
groups = collections.defaultdict(list)
for it in M['items']:
    pre = cmap['prefixes'].get(it['id'][:4])
    if it['c'] == 'interior' and pre and not pre.get('skip') and it.get('t') is not None:
        groups[(pre['category'], pre['placement'])].append(it)
random.seed(1)
sample = {k: random.sample(v, min(A.per, len(v))) for k, v in groups.items()}
by_pack = collections.defaultdict(list)
for k, v in sample.items():
    for it in v:
        by_pack[it['p']].append((k, it))
lp = collections.defaultdict(list)
for n, p in enumerate(sorted(by_pack)):
    txt = open(os.path.join(A.viewer, 'data', 'packs', M['packs'][p] + '.js'), encoding='utf-8').read()
    pack = json.loads(txt[txt.index(',') + 1: txt.rindex(')')])
    for k, it in by_pack[p]:
        ent = pack.get(f"interior:{it['id']}")
        if not ent or not ent.get('info'):
            continue
        imgs = {f: Image.open(io.BytesIO(base64.b64decode(v.split(',', 1)[1]))).convert('RGBA')
                for f, v in ent['files'].items() if isinstance(v, str) and v.startswith('data:image')}
        sizes = {f: im.size for f, im in imgs.items()}
        ops = lprender.frame_ops(ent['info'], ent.get('ani'), set(ent['files']), sizes, 'fl', 0)
        im = lprender.render_ops(ops, imgs) if ops else None
        if im is not None and im.getbbox():
            b = im.getchannel('A').getbbox()
            lp[k].append(math.sqrt((b[2] - b[0]) * (b[3] - b[1])))
    if n % 40 == 0:
        print(f'measuring LINE PLAY items: pack {n + 1}/{len(by_pack)}', flush=True)

rows, ratios = [], {}
for (cat, place), sizes in sorted(lp.items()):
    rsizes = [s for c in SAME.get(cat, (cat,)) for s in res.get((c, place), [])]
    if len(sizes) < 10 or len(rsizes) < 10:
        rows.append(f'  {cat:12s} {place:5s}  LINE PLAY {len(sizes):4d}  Resortopia {len(rsizes):4d}  (too few to compare)')
        continue
    r = statistics.median(rsizes) / statistics.median(sizes)
    ratios[cat] = (r, len(sizes))
    rows.append(f'  {cat:12s} {place:5s}  LINE PLAY median {statistics.median(sizes):6.1f} px ({len(sizes)})   '
                f'Resortopia {statistics.median(rsizes):6.1f} px ({len(rsizes)})   ratio {r:.2f}')
print('typical size (sqrt of width x height):'); print('\n'.join(rows))
if not ratios:
    sys.exit('nothing to compare')
all_scale = round(statistics.median([r for r, _ in ratios.values()]), 2)
cat_scale = {c: round(r / all_scale, 2) for c, (r, _) in ratios.items() if abs(r / all_scale - 1) > 0.15}
print(f'\nallScale {all_scale}   categoryScale {cat_scale}')
if A.write:
    cmap['allScale'] = all_scale
    cmap['categoryScale'] = cat_scale if A.per_category else {}
    with open(cmap_path, 'w', encoding='utf8') as f:
        json.dump(cmap, f, ensure_ascii=False, indent=2)
    print('written to', cmap_path)
