"""
LINE PLAY -> content pack, for the content shop (lib/contentpacks.js).

    python tools/content/lineplay/convert.py <export> <pack out dir> [--viewer D:/lineplay_viewer]
                                             [--id lineplay] [--name "LINE PLAY"] [--price 100]

    <export>        the checked-off items, exported from the LINE PLAY viewer (D:/lineplay_viewer):
                    its XML, JSON or CSV. Only the item ids (and collections) are needed from it; set
                    names in it (set, set_type) become collections when present.
    <pack out dir>  e.g. content-packs/lineplay (made or replaced)
    --viewer        the viewer folder: the pictures are read from its packs, and drawn with its own
                    renderer (tools/lprender.py), the way its thumbnails are

Needs Pillow. Writes <pack>/pack.json and <pack>/images/<key>.png, then
`node tools/content/preview.js <pack>` makes a page to look them over.

What it does with each item:
  - interior and garden items only. Clothing, pets, floor/wall patterns and shop pictures can't be den
    items; they are listed as left out, with why.
  - the picture: the item as drawn in a LINE PLAY room, facing front-left (the den mirrors it for the
    other way), first frame of any animation, base and overlay layers together
  - see-through edges are cut off (the bottom edge is where it meets the floor)
  - where it goes and its category chip, by its id prefix (category_map.json): wall decorations, doors
    and windows on a wall; rugs and floor tiles flat on the floor; the rest stand on the floor
  - size: allScale x groupScale x categoryScale x collectionScale x any prefix and item scale
    (category_map.json); calibrate.py sets them from the Resortopia pack's sizes
  - its sort offset: the back corner of its footprint. LINE PLAY's floor grid is 80 x 40 px per tile,
    so an item w x d tiles big has its back corner 20 * (w + d) px above its front one; at most 85% of
    its height. Items with no footprint use half their width, as the Resortopia pack does.
  - its name: its set's name and a word for its kind ("Midnight Sakura Fairies Table"), or, with no set,
    the word and its product code ("Table RUTA0003H"). LINE PLAY never named single items.
  - collections: its set (when known, grouped by the set's kind, e.g. "LINE PLAY Original") and its
    LINE PLAY category
  - items whose final pictures are the same (or mirrored) are made one, in all their collections
"""
import argparse, base64, collections, csv, hashlib, io, json, os, re, shutil, sys
import xml.etree.ElementTree as ET
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FLOOR, WALL, RUG = 'floor', 'wall', 'rug'
MAX_NAME = 40
ID_RANGES = [(10000, 49999)]  # lib/itemids.js CONTENT_DEN: every pack's new items share these ids
TILE_HALF_H = 20  # half a LINE PLAY floor tile's height (tiles are 80 x 40)


def read_export(path):
    """[{id, collection, set, set_type, ...}] from the viewer's XML, JSON or CSV export"""
    ext = os.path.splitext(path)[1].lower()
    if ext == '.xml':
        root = ET.parse(path).getroot()
        return [{c.tag: (c.text or '') for c in item} for item in root.iter('item')]
    if ext == '.csv':
        with open(path, encoding='utf-8-sig', newline='') as f:
            return list(csv.DictReader(f))
    data = json.load(open(path, encoding='utf-8'))
    return data['items'] if isinstance(data, dict) else data


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-') or 'x'


def clean_name(text):
    text = re.sub(r"[^\w '&!?.,:()#+\-]", ' ', text.replace('\u2019', "'"), flags=re.UNICODE)
    text = re.sub(r'\s+', ' ', text).strip(' -,.:')
    if len(text) > MAX_NAME:
        text = text[:MAX_NAME].rsplit(' ', 1)[0].rstrip(' -,.:&')
    return text


def title(text):
    small = {'a', 'an', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'or'}
    out = []
    for i, w in enumerate(text.split()):
        out.append(w.lower() if i and w.lower() in small else (w[:1].upper() + w[1:]))
    return ' '.join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('export')
    ap.add_argument('out')
    ap.add_argument('--viewer', default=r'D:\lineplay_viewer')
    ap.add_argument('--id', default='lineplay')
    ap.add_argument('--name', default='LINE PLAY')
    ap.add_argument('--price', type=int, default=100)
    A = ap.parse_args()
    sys.path.insert(0, os.path.join(A.viewer, 'tools'))
    import lprender

    cmap = json.load(open(os.path.join(HERE, 'category_map.json'), encoding='utf8'))
    man = open(os.path.join(A.viewer, 'data', 'manifest.js'), encoding='utf-8').read()
    M = json.loads(man[man.index('(') + 1: man.rindex(')')])
    by_key = {f"{it['c']}:{it['id']}": it for it in M['items']}
    # product codes for items the 2014 catalogue doesn't list: the viewer's rule (letters by prefix + the
    # serial in base 36), from its data/categories.js
    cat_js = open(os.path.join(A.viewer, 'data', 'categories.js'), encoding='utf-8').read()
    letters = dict(re.findall(r"'(\d{4})':\s*'([A-Z]{4})'", cat_js[cat_js.index('LP.codeLetters'):]))

    def derive_code(iid):
        if not (iid.isdigit() and len(iid) == 9 and iid[:4] in letters):
            return ''
        n, digits = int(iid[4:]), ''
        while n:
            n, r = divmod(n, 36)
            digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[r] + digits
        return letters[iid[:4]] + digits.rjust(5, '0')

    warnings = collections.Counter()
    examples = collections.defaultdict(list)

    def warn(kind, example):
        warnings[kind] += 1
        if len(examples[kind]) < 6:
            examples[kind].append(example)

    # what to make, by viewer pack (each pack is read once)
    wanted = collections.defaultdict(list)
    for row in read_export(A.export):
        iid = str(row.get('id', '')).strip()
        col = str(row.get('collection', '')).strip() or ('garden' if f'garden:{iid}' in by_key and f'interior:{iid}' not in by_key else 'interior')
        it = by_key.get(f'{col}:{iid}')
        if not it:
            warn('not in this viewer build', f'{col}:{iid}')
            continue
        if col not in ('interior', 'garden'):
            warn({'clothing': 'clothing (only den items can be made)', 'pet': 'pet (only den items can be made)'}.get(col, f'{col} (only den items can be made)'), iid)
            continue
        wanted[it['p']].append((it, row))

    images_dir = os.path.join(A.out, 'images')
    if os.path.isdir(images_dir):
        shutil.rmtree(images_dir)
    os.makedirs(images_dir)

    items, by_picture, cols_seen = [], {}, {}

    def collection(cid, name, group, kind, order):
        cols_seen.setdefault(cid, {'id': cid, 'name': name, 'group': group, 'kind': kind, 'order': order})
        return cid

    for p in sorted(wanted):
        txt = open(os.path.join(A.viewer, 'data', 'packs', M['packs'][p] + '.js'), encoding='utf-8').read()
        pack = json.loads(txt[txt.index(',') + 1: txt.rindex(')')])
        for it, row in wanted[p]:
            iid, col = it['id'], it['c']
            override = cmap['items'].get(iid, {})
            pre = cmap['prefixes'].get(iid[:4]) or (cmap['gardenDefault'] if col == 'garden' else None)
            if pre is None:
                warn('id prefix not in category_map.json (taken as floor decor)', iid)
                pre = {'category': 'decor', 'placement': FLOOR, 'noun': 'Decoration'}
            if override.get('skip') or pre.get('skip'):
                warn('left out: ' + (override.get('skip') if isinstance(override.get('skip'), str) else pre.get('skip') or 'skip'), iid)
                continue
            ent = pack.get(f'{col}:{iid}')
            if not ent or not ent.get('info'):
                warn('no layout record (no picture can be drawn)', iid)
                continue
            imgs = {f: Image.open(io.BytesIO(base64.b64decode(v.split(',', 1)[1]))).convert('RGBA')
                    for f, v in ent['files'].items() if isinstance(v, str) and v.startswith('data:image')}
            sizes = {f: im.size for f, im in imgs.items()}
            flags = []
            im = None
            for d in ('fl', 'fr'):
                ani = None if pre.get('noAnimation') else ent.get('ani')
                ops = lprender.frame_ops(ent['info'], ani, set(ent['files']), sizes, d, 0)
                im = lprender.render_ops(ops, imgs) if ops else None
                if im is not None and max(im.size) > 1600 and ani:
                    # a huge effect animation around the item (some garden pieces): the item alone
                    im = lprender.render_ops(lprender.frame_ops(ent['info'], None, set(ent['files']), sizes, d, 0), imgs)
                    flags.append('animation-left-out')
                if im is not None and im.getbbox():
                    if d == 'fr':
                        flags.append('front-right-picture')
                    break
            if im is None or not im.getbbox():
                warn('nothing to draw', iid)
                continue
            im = im.crop(im.getchannel('A').getbbox())
            if it.get('anim') and 'animation-left-out' not in flags:
                flags.append('animated (first frame)')

            placement = override.get('placement', pre['placement'])
            category = override.get('category', pre['category'])
            if category not in cmap['categories']:
                warn('unknown category chip (made decor)', f'{iid}: {category}')
                category = 'decor'
            group = 'Garden' if col == 'garden' else 'Interior'

            # collections: its set, when the export knows it, and its LINE PLAY category
            set_name = clean_name(str(row.get('set') or row.get('set_name') or '').strip())
            if set_name and all(not w[:1].isupper() for w in set_name.split()[1:]):
                set_name = title(set_name)  # Pinterest titles are often in sentence case
            set_type = str(row.get('set_type') or '').split(',')[0].strip()
            cols = []
            if set_name:
                cols.append(collection(f'set-{slug(set_name)}', set_name,
                                       set_type or 'Sets', 'set', 1))
            catname = str(row.get('category') or '').split('(')[0].strip() or cmap['categories'][category]
            cols.append(collection(f'{slug(group)}-{iid[:4]}', catname, group, 'basics', int(iid[:4]) if iid[:4].isdigit() else 9999))

            by_col = next((cmap['collectionScale'][c] for c in cols if c in cmap.get('collectionScale', {})), 1.0)
            scale = (cmap.get('allScale', 1.0) * cmap.get('groupScale', {}).get(group, 1.0) * cmap.get('categoryScale', {}).get(category, 1.0)
                     * by_col * pre.get('scale', 1.0) * override.get('scale', 1.0))
            if abs(scale - 1.0) > 1e-6:
                im = im.convert('RGBa').resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS).convert('RGBA')
            if max(im.size) > 2048:
                warn('too big (over 2048 px, left out)', f'{iid} {im.size}')
                continue

            sz = it.get('sz') or (ent['info'].get('size') if isinstance(ent['info'], dict) else None)
            if placement != FLOOR:
                so = 0
            elif sz and sz[0] and sz[1]:
                so = min(round(TILE_HALF_H * (sz[0] + sz[1]) * scale), round(im.height * 0.85))
            else:
                so = min(round(im.width * 0.5), round(im.height * 0.85))
            so = int(override.get('so', so))

            code = str(row.get('product_code') or it.get('code') or '').strip() or derive_code(iid)
            noun = pre.get('noun', cmap['categories'][category])
            name = clean_name(override.get('name') or (f'{set_name} {noun}' if set_name else f'{noun} {code or iid}'))

            buf = io.BytesIO()
            im.save(buf, 'PNG', optimize=True)
            digest = hashlib.sha256(im.tobytes() + bytes(str(im.size), 'ascii')).hexdigest()
            mirrored = im.transpose(Image.FLIP_LEFT_RIGHT)
            mdigest = hashlib.sha256(mirrored.tobytes() + bytes(str(mirrored.size), 'ascii')).hexdigest()
            tags = sorted({t for t in [group, catname, set_name, set_type, code, iid] if t})
            same = by_picture.get(digest) or by_picture.get(mdigest)
            if same:
                same['collections'] = list(dict.fromkeys(same['collections'] + cols))
                same['aliases'].append(iid)
                same['tags'] = sorted(set(same['tags']) | set(tags))
                continue
            key = re.sub(r'[^A-Za-z0-9_\-]', '_', code or iid)
            while any(i['key'] == key for i in items):
                key += '_'
            with open(os.path.join(images_dir, key + '.png'), 'wb') as f:
                f.write(buf.getvalue())
            item = {
                'key': key, 'name': name, 'image': f'images/{key}.png', 'width': im.width, 'height': im.height,
                'placement': placement, 'category': category, 'collections': cols, 'so': so,
                'structural': False, 'tile': 'floor' if iid[:4] == '1215' else None,
                'footprint': f'{sz[0]}x{sz[1]}' if sz and sz[0] and sz[1] else '',
                'tags': tags, 'nameCn': '', 'aliases': [iid], 'flags': flags,
                'source': {'id': iid, 'code': code, 'collection': col, 'scale': round(scale, 3),
                           'set': set_name or None, 'set_source': row.get('set_source') or None},
            }
            by_picture[digest] = item
            items.append(item)

    # the same name for different pictures: numbered
    named = collections.defaultdict(list)
    for item in items:
        named[item['name'].lower()].append(item)
    for same in named.values():
        if len(same) > 1:
            for n, item in enumerate(same, 1):
                item['name'] = clean_name(f"{item['name'][:MAX_NAME - 4]} #{n}")

    used = collections.Counter(c for i in items for c in i['collections'])
    cols = [c for c in cols_seen.values() if used[c['id']]]
    groups = sorted({c['group'] for c in cols if c['kind'] == 'set'}) + [g for g in ('Interior', 'Garden') if any(c['group'] == g for c in cols)]
    cols.sort(key=lambda c: (groups.index(c['group']), c['kind'] == 'basics', c['order'], c['name']))
    for c in cols:
        c['count'] = used[c['id']]
    pack = {'id': A.id, 'name': A.name, 'version': 1, 'price': A.price, 'groups': groups,
            'categories': [{'id': k, 'name': v} for k, v in cmap['categories'].items()], 'collections': cols, 'items': items}
    with open(os.path.join(A.out, 'pack.json'), 'w', encoding='utf8') as f:
        json.dump(pack, f, ensure_ascii=False, indent=1)

    # the id budget every pack shares (lib/contentpacks.js gives each new item one of 10000-49999)
    others = 0
    parent = os.path.dirname(os.path.abspath(A.out))
    for d in os.listdir(parent):
        pj = os.path.join(parent, d, 'pack.json')
        if d.startswith('_') or os.path.abspath(os.path.join(parent, d)) == os.path.abspath(A.out) or not os.path.exists(pj):
            continue
        try:
            others += len(json.load(open(pj, encoding='utf8')).get('items', []))
        except Exception:
            pass
    budget = sum(last - first + 1 for first, last in ID_RANGES)

    print(f'{len(items)} items ({sum(len(i["aliases"]) for i in items)} LINE PLAY ids), {len(cols)} collections')
    print('  placement:', dict(collections.Counter(i['placement'] for i in items)))
    print('  categories:', dict(collections.Counter(i['category'] for i in items).most_common()))
    print('  flags:', dict(collections.Counter(f for i in items for f in i['flags'])))
    for kind, n in warnings.most_common():
        print(f'  left out / warning: {kind}: {n}, e.g. {examples[kind]}')
    print(f'  ids: other packs use {others}, this one {len(items)}, of {budget} in all'
          + ('  (TOO MANY: the server will leave out what does not fit)' if others + len(items) > budget else ''))
    print(f'next: node tools/content/preview.js {A.out}')


if __name__ == '__main__':
    main()
