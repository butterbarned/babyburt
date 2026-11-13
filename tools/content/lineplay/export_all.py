"""
Every interior and garden item in the LINE PLAY viewer, as one export file for convert.py: the same fields
the viewer's "Export JSON" gives for checked-off items (id, collection, category, product code, set...).

    python tools/content/lineplay/export_all.py <out.json> [--viewer D:/lineplay_viewer]

The set names are the viewer's (data/sets.js, written by D:/lineplay_setmatch/apply.py). After they change,
run this and convert.py again: items keep their keys (product codes), so the server keeps their ids and only
their names and collections change.
"""
import argparse, json, os, re


def js_object(path, call):
    txt = open(path, encoding='utf-8').read()
    return txt[txt.index(call + '(') + len(call) + 1: txt.rindex(')')]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('out')
    ap.add_argument('--viewer', default=r'D:\lineplay_viewer')
    A = ap.parse_args()
    data = os.path.join(A.viewer, 'data')
    M = json.loads(js_object(os.path.join(data, 'manifest.js'), 'LP.manifest'))
    sets = json.loads(js_object(os.path.join(data, 'sets.js'), 'LP.sets'))
    cats = dict(re.findall(r"'(\d{4})':\s*'([^']*)'", js_object(os.path.join(data, 'categories.js'), 'LP.categories')))
    items = []
    for it in M['items']:
        if it['c'] not in ('interior', 'garden'):
            continue
        iid = str(it['id'])
        s = sets.get(f"{it['c']}:{iid}", {})
        items.append({'id': iid, 'collection': it['c'], 'category_prefix': iid[:4], 'category': cats.get(iid[:4]),
                      'product_code': it.get('code') or None, 'animated': bool(it.get('anim')),
                      'set': s.get('set'), 'set_type': s.get('type'), 'set_release': s.get('release'),
                      'set_source': s.get('src'), 'set_confidence': s.get('conf')})
    with open(A.out, 'w', encoding='utf-8') as f:
        json.dump({'exported_from': 'export_all.py', 'manifest_built': M.get('built'), 'count': len(items), 'items': items},
                  f, ensure_ascii=False, indent=1)
    print(f"{len(items)} items ({sum(1 for i in items if i['set'])} with a set name) -> {A.out}")


if __name__ == '__main__':
    main()
