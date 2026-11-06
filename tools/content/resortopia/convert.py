"""
Resortopia -> content pack, for the content shop (lib/contentpacks.js).

    python tools/content/resortopia/convert.py <resortopia assets dir> <furniture_index.json> <pack out dir>

    <resortopia assets dir>   the folder with resources/ in it, e.g.
                              D:/Resortopia_12.5.1_APKPure/resortopiaAP/assets/assets
    <furniture_index.json>    made by resortopia_tools/extract_furniture.py
    <pack out dir>            e.g. content-packs/resortopia (made or replaced)

Needs Pillow. Writes <pack>/pack.json and <pack>/images/<key>.png, then
`node tools/content/preview.js <pack>` makes a page to look them over.

What it does with each item that has a picture:
  - the picture is the sprite the game draws in its rooms: the item's icon,
    or, when its room prefab draws one other sprite, that one (a few
    building pieces). an item whose prefab draws several sprites
    ("several-sprites"), or no still one (animated items and some wall
    pieces: "shop-picture"), keeps its icon and is flagged.
  - see-through edges are cut off (the bottom edge is where it meets the floor)
  - scaled by its building (category_map.json buildingScale: the garden's are
    drawn bigger than AJ's furniture) and any per item override
  - where it goes, from the game's own placement code (utype): on the floor,
    on a wall, or flat on the floor (rugs, paths, floor tiles)
  - its sort offset: half its width (where AJ's own furniture has it, about
    the back corner of its footprint), at most 85% of its height
  - its category chip and collections (its set, its building's basics, any
    festival; building pieces only in Building Pieces)
  - items whose final pictures are the same are made one, in all their
    collections
"""
import collections, hashlib, io, json, os, re, shutil, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"


def decompress_uuid(u):
    u = u.split('@')[0]
    if len(u) != 22:
        return u
    h = u[:2]
    for i in range(2, 22, 2):
        a, b = B64.index(u[i]), B64.index(u[i + 1])
        h += '%x%x%x' % (a >> 2, ((a & 3) << 2) | (b >> 4), b & 15)
    return f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:]}"


class Bundle:
    """A Cocos Creator 2.x asset bundle: paths <-> uuids, import JSON, native files."""

    def __init__(self, root):
        self.root = root
        cfg = json.load(open(os.path.join(root, 'config.json'), encoding='utf8'))
        self.uuids = [decompress_uuid(u) for u in cfg['uuids']]
        self.index_of = {u: i for i, u in enumerate(self.uuids)}
        types = cfg['types']
        self.by_path = collections.defaultdict(dict)
        self.path_of = {}
        for k, v in cfg['paths'].items():
            self.by_path[v[0]][types[v[1]]] = int(k)
            self.path_of[int(k)] = (v[0], types[v[1]])

    def import_json(self, idx):
        u = self.uuids[idx]
        return json.load(open(os.path.join(self.root, 'import', u[:2], u + '.json'), encoding='utf8'))

    def native(self, uuid):
        for ext in ('.png', '.jpg', '.webp'):
            p = os.path.join(self.root, 'native', uuid[:2], uuid + ext)
            if os.path.exists(p):
                return p
        return None

    def json_asset(self, path):
        return self.import_json(self.by_path[path]['cc.JsonAsset'])[5][0][2]

    def sprite(self, path):
        """(png file, rect, rotated) of a sprite frame path, or None"""
        t = self.by_path.get(path, {})
        if 'cc.SpriteFrame' not in t:
            return None
        d = self.import_json(t['cc.SpriteFrame'])
        meta = d[5][0]
        png = self.native(decompress_uuid(d[1][0]))
        return (png, meta.get('rect'), bool(meta.get('rotated'))) if png else None

    def prefab_frames(self, path):
        """the sprite frame paths a prefab uses, or None when there is no prefab"""
        t = self.by_path.get(path, {})
        if 'cc.Prefab' not in t:
            return None
        d = self.import_json(t['cc.Prefab'])
        out = []
        for short in d[1]:
            p = self.path_of.get(self.index_of.get(decompress_uuid(short)))
            if p and p[1] == 'cc.SpriteFrame':
                out.append(p[0])
        return out


def crop(png, rect, rotated):
    im = Image.open(png)
    if rect:
        x, y, w, h = rect[:4]
        if rotated:
            im = im.crop((x, y, x + h, y + w)).rotate(90, expand=True)
        elif (x, y, w, h) != (0, 0) + im.size:
            im = im.crop((x, y, x + w, y + h))
    return im.convert('RGBA')


# ---- names -------------------------------------------------------------------

SMALL = {'a', 'an', 'and', 'of', 'the', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'or'}
UPPER = {'TV', 'DJ', 'UFO', 'DIY', 'II', 'III', 'IV', 'VR', 'CD', 'BBQ', 'ABC'}
NAME_OK = re.compile(r"[^\w '&!?.,:()#+\-]", re.UNICODE)
MAX_NAME = 40


def title(text):
    words = []
    for i, word in enumerate(text.strip().split()):
        if word.upper() in UPPER:
            words.append(word.upper())
        elif i > 0 and word.lower() in SMALL:
            words.append(word.lower())
        else:
            # each part after - or a quote starts upper ("Baa-Baa"), but not a
            # possessive or contraction ("Hatter's", "Lil'")
            words.append(re.sub(r"(^|[-(/\"])(\w)", lambda m: m.group(1) + m.group(2).upper(), word.lower()))
    return ' '.join(words)


def clean_name(text):
    text = NAME_OK.sub(' ', text.replace('\u2019', "'").replace('/', ' ').replace('_', ' '))
    text = re.sub(r'\s+', ' ', text).strip(' -,.:')
    if len(text) > MAX_NAME:
        text = text[:MAX_NAME].rsplit(' ', 1)[0].rstrip(' -,.:&')
    return text


# ---- categories by name -------------------------------------------------------

KEYWORDS = [
    ('building', r'\b(STAIRCASE|STAIRS|ESCALATOR|STEPS)\b'),
    ('rugs', r'\b(RUG|CARPET|DOORMAT|MAT|PATH)\b'),
    ('windows', r'\bWINDOWS?\b'),
    ('bathroom', r'\b(TOILET|SINK|BATH|BATHTUB|SHOWER|TUB|VANITY|HOT SPRING|BATHROBE|TOILETRIES)\b'),
    ('beds', r'\b(BED|CRIB|CRADLE|FUTON|BUNK)\b'),
    ('sofas', r'\b(SOFA|COUCH|LOVESEAT|SETTEE)\b'),
    ('seating', r'\b(CHAIR|STOOL|SEAT|BENCH|THRONE|OTTOMAN|POUF|CUSHION|ARMCHAIR)\b'),
    ('tables', r'\b(TABLE|DESK|COUNTER|BAR|WORKBENCH|STAND)\b'),
    ('lighting', r'\b(LAMP|LANTERNS?|LIGHTS?|CANDLES?|CHANDELIER|STREETLIGHT|TORCH|NEON)\b'),
    ('electronics', r'\b(TV|TELEVISION|CONSOLE|COMPUTER|RADIO|PHONE|FRIDGE|REFRIGERATOR|OVEN|STOVE|MICROWAVE|PROJECTOR|SPEAKER|PLAYER|ARCADE|JUKEBOX|WASHING)\b'),
    ('fun', r'\b(SWING|SLIDE|TRAMPOLINE|SEESAW|GAME|CLAW|TOYS?|DOLL|GACHAPON|BALLOONS?|TRAIN|KART|CAROUSEL|HAMMOCK|PIANO|GUITAR|DRUMS?|CHESS|BASKETBALL|DARTS?|PUZZLE|MACHINE|BALL|ROCKING)\b'),
    ('storage', r'\b(CABINET|SHELF|SHELVES|WARDROBE|DRESSER|CLOSET|DRAWERS?|BOOKCASE|BOOKSHELF|RACK|CHEST|BOX|CUPBOARD|STORAGE|CRATE|BASKET|TRUNK)\b'),
    ('plants', r'\b(PLANTS?|TREES?|BUSH|FLOWERS?|FLORAL|BONSAI|CACTUS|SHRUBS?|SHRUBBERY|BLOOMS?|VINES?|GRASS|FERN|BAMBOO|PINE|MAPLE|SUCCULENT|BOUQUET|BLOSSOMS?|TULIPS?|ROSES?|POTTED|GARDEN|HEDGE|REEDS)\b'),
    ('fences', r'\b(FENCE|RAILING|GATE|HANDRAIL|GUARDRAIL)\b'),
    ('walls', r'\b(WALL|SCREEN|PARTITION|DIVIDER)\b'),
    ('wall-decor', r'\b(PAINTING|CLOCK|POSTER|MIRROR|FRAME|WREATH|BANNER|PORTRAIT|PHOTO|SCROLL|CALENDAR)\b'),
    ('food', r'\b(CAKES?|CUPCAKES?|BREAD|PANCAKES?|COOKIES?|CANDY|CANDIES|POPSICLES?|ICE CREAM|KETCHUP|SNACKS?|DESSERTS?|FEAST|SOUP|TEA SET|COFFEE|JUICE|DRINKS?|FRUITS?|BERRY|BERRIES|PIE|PUDDING|CHOCOLATE|DONUTS?|CROISSANTS?|SANDWICH|SUSHI|ODEN|TAKOYAKI|NOODLES?|DUMPLINGS?|BUBBLEGUM|MOONCAKES?|SENBEI|CIABATTA|BEANS|VEGETABLES|CHEESE|LOLLIPOPS?|MACARONS?|WAFFLES?|POPCORN|TOAST|BURGER|PIZZA|SALAD|CEREAL|JELLY|CANNED|CONE)\b'),
]


def infer_category(name, placement):
    upper = name.upper()
    for cat, pattern in KEYWORDS:
        if re.search(pattern, upper):
            if placement == 'wall' and cat in ('walls', 'storage', 'lighting', 'plants', 'decor'):
                return 'wall-decor'
            return cat
    return 'wall-decor' if placement == 'wall' else 'decor'


# ---- placement from the game's own code ---------------------------------------
# utype, the same in the room, garden and pet tables: 0, 2, 31 on the floor;
# 1 flat on the floor; 3 windows, 4 hung on a wall; 5 screens; 6 a wall
# piece (in the garden and pet house, fences and railings); 7 and 22 floor
# tiles; 8 and 21 wall tiles (wallpaper); 9, 10, 23, 32 platforms, stairs,
# railings and staircases (building pieces).
FLOOR, WALL, RUG = 'floor', 'wall', 'rug'
UTYPE = {0: FLOOR, 2: FLOOR, 31: FLOOR, 1: RUG, 3: WALL, 4: WALL, 5: FLOOR, 6: FLOOR, 7: RUG, 22: RUG, 8: FLOOR, 21: FLOOR,
         9: FLOOR, 10: FLOOR, 23: FLOOR, 32: FLOOR}
UTYPE_STRUCTURAL = {9, 10, 23, 32}
# what may later be a real AJ floor or wallpaper (a single tile of one)
UTYPE_TILE = {7: 'floor', 22: 'floor', 8: 'wall', 21: 'wall'}


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-') or 'x'


BUILDINGS = ['Garden', 'Guest Rooms', 'My Home', 'Pet House', 'Special Furnishings']
BASICS = {'Garden': 'Garden Basics', 'Guest Rooms': 'Guest Room Basics', 'My Home': 'Home Basics',
          'Pet House': 'Pet House Basics', 'Special Furnishings': 'More Specials'}


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)
    assets, index_file, out = sys.argv[1:]
    cmap = json.load(open(os.path.join(HERE, 'category_map.json'), encoding='utf8'))
    bundle = Bundle(os.path.join(assets, 'resources'))
    index = json.load(open(index_file, encoding='utf8'))
    utypes = {}
    for table in ('roomFurnitureAttr', 'gardenFurnitureAttr', 'petFurnitureAttr'):
        for row in bundle.json_asset('common/json/commonJson/' + table):
            utypes.setdefault(str(row['id']), row.get('utype'))

    warnings = collections.Counter()
    warn_examples = collections.defaultdict(list)

    def warn(kind, example):
        warnings[kind] += 1
        if len(warn_examples[kind]) < 6:
            warn_examples[kind].append(example)

    images_dir = os.path.join(out, 'images')
    if os.path.isdir(images_dir):
        shutil.rmtree(images_dir)
    os.makedirs(images_dir)

    by_picture = {}  # sha of the final picture -> item
    items = []
    collections_seen = {}  # id -> collection

    def collection(cid, name, group, kind, order):
        if cid not in collections_seen:
            collections_seen[cid] = {'id': cid, 'name': name, 'group': group, 'kind': kind, 'order': order}
        return cid

    for rec in index:
        rid = rec['id']
        if not rec.get('icon_file'):
            continue
        override = cmap['items'].get(rid, {})
        if override.get('skip'):
            continue
        sets = [m for m in rec['sets'] if m['building'] in BUILDINGS]
        if not sets:
            continue
        flags = []

        # the picture: what the room prefab draws, where that is one sprite
        source = (rec['icon_file'], rec.get('icon_rect'), False)
        if rec.get('icon_rect') and 'rotated' in rec['icon_rect']:
            source = (rec['icon_file'], rec['icon_rect'][:4], True)
        frames = bundle.prefab_frames(rec['prefab']) if rec.get('prefab') else None
        if frames is not None and not frames:
            flags.append('shop-picture')
        elif frames and rec['icon_asset'] not in frames:
            if len(frames) == 1 and bundle.sprite(frames[0]):
                source = bundle.sprite(frames[0])
                flags.append('prefab-sprite')
            else:
                flags.append('several-sprites')
        try:
            im = crop(*source)
        except Exception as err:
            warn('unreadable picture', f'{rid}: {err}')
            continue
        box = im.getchannel('A').getbbox()
        if not box:
            warn('empty picture', rid)
            continue
        im = im.crop(box)

        utype = utypes.get(rid)
        placement = UTYPE.get(utype, FLOOR)
        if utype not in UTYPE:
            warn('unknown utype (taken as floor)', f'{rid} utype={utype}')
        en = rec['name'] if rec['name'] and rec['name'] != rid else ''
        if placement == FLOOR and re.search(r'\b(RUG|CARPET|DOORMAT)\b', en.upper()):
            placement = RUG
        placement = override.get('placement', placement)

        # category and building piece, from its first set's category
        cats = [m['category'] for m in sets]
        entries = [cmap['map'].get(c) for c in cats]
        for c, e in zip(cats, entries):
            if e is None:
                warn('category not in category_map.json (inferred)', c)
        structural = bool(override.get('structural', utype in UTYPE_STRUCTURAL or any(e and e.get('structural') for e in entries)))
        first = next((e for e in entries if e), {'category': 'infer'})
        category = override.get('category') or (infer_category(en, placement) if first['category'] == 'infer' else first['category'])
        if category not in cmap['categories']:
            warn('unknown category chip (made decor)', f'{rid}: {category}')
            category = 'decor'

        # collections
        cols = []
        if structural:
            cols.append(collection('building-pieces', 'Building Pieces', 'Building Pieces', 'building', 0))
        else:
            for m in sets:
                b = m['building']
                s = m['set']
                if s.startswith('_') or s.lower().startswith('decorate_size_type'):
                    cols.append(collection(f'{slug(b)}-basics', BASICS[b], b, 'basics', 999))
                else:
                    order = int(m['set_no']) if str(m['set_no']).isdigit() else 500
                    cols.append(collection(f'{slug(b)}-{slug(s)}', title(s), b, 'set', order))
            festivals = list(rec.get('festival_tags') or [])
            festivals += [c for c, e in zip(cats, entries) if e and e.get('festival')]
            for f in festivals:
                cols.append(collection(f'festival-{slug(f)}', title(f), 'Festivals', 'festival', 0))
        cols = list(dict.fromkeys(cols))

        # size: allScale (every item), times the building's, times any size for its category chip or one of
        # its collections (categoryScale / collectionScale: what the preview's
        # "try a size" slider copies), times the item's own
        building = sets[0]['building']
        by_collection = next((cmap.get('collectionScale', {})[c] for c in cols if c in cmap.get('collectionScale', {})), 1.0)
        scale = (cmap.get('allScale', 1.0) * cmap['buildingScale'].get(building, 1.0) * (first.get('scale') or 1.0) * cmap.get('categoryScale', {}).get(category, 1.0)
                 * by_collection * override.get('scale', 1.0))
        if abs(scale - 1.0) > 1e-6:
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            im = im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
        if max(im.size) > 2048:
            warn('too big (over 2048 px, left out)', f'{rid} {im.size}')
            continue

        so = 0 if placement != FLOOR else min(round(im.width * 0.5), round(im.height * 0.85))
        so = int(override.get('so', so))


        if not en:
            flags.append('no-name')
        name = clean_name(override.get('name') or title(en) or f"{cmap['categories'][category]} {rid}")

        buf = io.BytesIO()
        im.save(buf, 'PNG', optimize=True)
        data = buf.getvalue()
        digest = hashlib.sha256(im.tobytes() + bytes(str(im.size), 'ascii')).hexdigest()
        # the same picture mirrored is the same item: the game flips any item
        # (Resortopia has one for each way it faces, as windows on its two walls)
        mirrored = im.transpose(Image.FLIP_LEFT_RIGHT)
        mirror_digest = hashlib.sha256(mirrored.tobytes() + bytes(str(mirrored.size), 'ascii')).hexdigest()
        tags = sorted({t for t in [building] + [title(c) for c in cats if not c.startswith(('pettype', 'roomtype', 'gardentype'))]
                       + [title(m['set']) for m in sets if not m['set'].startswith('_') and not m['set'].lower().startswith('decorate_size_type')]})
        same = by_picture.get(digest) or by_picture.get(mirror_digest)
        if same:
            item = same
            item['_labels'] += [l for l in [title(m['set']) for m in sets if not m['set'].startswith('_')] if l not in item['_labels']]
            item['collections'] = list(dict.fromkeys(item['collections'] + cols))
            item['aliases'].append(rid)
            item['tags'] = sorted(set(item['tags']) | set(tags))
            item['structural'] = item['structural'] and structural
            if digest not in by_picture and 'mirrored-twin' not in item['flags']:
                item['flags'].append('mirrored-twin')
            continue
        key = re.sub(r'[^A-Za-z0-9_\-]', '_', rid)
        while any(i['key'] == key for i in items):
            key += '_'
        with open(os.path.join(images_dir, key + '.png'), 'wb') as f:
            f.write(data)
        item = {
            'key': key, 'name': name, 'image': f'images/{key}.png', 'width': im.width, 'height': im.height,
            'placement': placement, 'category': category, 'collections': cols, 'so': so,
            'structural': structural, 'tile': UTYPE_TILE.get(utype), 'footprint': rec.get('size') or '',
            'tags': tags, 'nameCn': rec.get('name_cn', ''), 'aliases': [rid], 'flags': flags,
            '_labels': [title(m['set']) for m in sets if not m['set'].startswith('_') and not m['set'].lower().startswith('decorate_size_type')]
                       + [title(c) for c in cats if not c.startswith(('pettype', 'roomtype', 'gardentype'))],
            'source': {'id': rid, 'building': building, 'utype': utype, 'scale': round(scale, 3)},
        }
        by_picture[digest] = item
        items.append(item)

    # an item merged with a building piece and a non-piece is not a piece:
    # it keeps only its other collections
    for item in items:
        if not item['structural'] and 'building-pieces' in item['collections'] and len(item['collections']) > 1:
            item['collections'].remove('building-pieces')

    # the same name for different pictures: told apart by their Resortopia
    # set, then their Resortopia category, then a number
    named = collections.defaultdict(list)
    for item in items:
        named[item['name'].lower()].append(item)
    for same in named.values():
        if len(same) < 2:
            continue
        base = same[0]['name']
        chosen = [None] * len(same)
        for depth in range(4):
            labels = [(i['_labels'][depth] if depth < len(i['_labels']) else None) for i in same]
            for n, label in enumerate(labels):
                if (chosen[n] is None and label and label.lower() not in base.lower() and labels.count(label) == 1
                        and len(base) + len(label) + 3 <= MAX_NAME):
                    chosen[n] = label
        taken = collections.Counter()
        for item, label in zip(same, chosen):
            name = clean_name(f"{base} ({label})") if label else ''
            if not label or len(name) <= len(base) + 3:
                taken[base] += 1
                name = clean_name(f"{base[:MAX_NAME - 4]} #{taken[base]}")
            item['name'] = name
    for item in items:
        del item['_labels']

    used = collections.Counter(c for i in items for c in i['collections'])
    group_order = BUILDINGS + ['Festivals', 'Building Pieces']
    cols = sorted((c for c in collections_seen.values() if used[c['id']]),
                  key=lambda c: (group_order.index(c['group']), c['kind'] == 'basics', c['order'], c['name']))
    for c in cols:
        c['count'] = used[c['id']]
    pack = {
        'id': 'resortopia',
        'name': 'Resortopia',
        'version': 1,
        'price': 100,
        'groups': group_order,
        'categories': [{'id': k, 'name': v} for k, v in cmap['categories'].items()],
        'collections': cols,
        'items': items,
    }
    with open(os.path.join(out, 'pack.json'), 'w', encoding='utf8') as f:
        json.dump(pack, f, ensure_ascii=False, indent=1)

    print(f'{len(items)} items ({sum(len(i["aliases"]) for i in items)} Resortopia ids), {len(cols)} collections')
    print('  placement:', dict(collections.Counter(i['placement'] for i in items)))
    print('  building pieces:', sum(i['structural'] for i in items))
    print('  categories:', dict(collections.Counter(i['category'] for i in items).most_common()))
    print('  flags:', dict(collections.Counter(f for i in items for f in i['flags'])))
    for kind, n in warnings.most_common():
        print(f'  warning: {kind}: {n}, e.g. {warn_examples[kind]}')


if __name__ == '__main__':
    main()
