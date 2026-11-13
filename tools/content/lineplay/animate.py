"""
Animations and music for a LINE PLAY content pack. Run it after convert.py (which rewrites pack.json):

    python tools/content/lineplay/animate.py content-packs/lineplay [--viewer D:/lineplay_viewer]
                                             [--max-frames 64] [--only KEY,KEY] [--workers 3]

For every item whose LINE PLAY original is animated or has music, it writes
  anims/<key>.png   the animation's frames in a grid, every cell the same size (the box all frames fit in),
                    drawn as convert.py draws the item's picture: same facing, same size
  sounds/<key>.mp3  its music (LINE PLAY's BGM .ogg, by ffmpeg)
  images/<key>.png  (replaced) the animation's first frame, cropped, so the still picture and the animation
                    line up to the pixel; pack.json's width and height follow it
and adds to the item in pack.json
  "anim":  {"image": "anims/<key>.png", "frames": n, "cols": c, "w": cell w, "h": cell h,
            "x": cell's left - picture's left, "y": cell's top - picture's top, "ms": [each frame's time]}
  "sound": "sounds/<key>.mp3"
The server (lib/contentpacks.js) gives these to the game, which plays them when the item is clicked or
hovered, as its owner chooses in the den editor's layers panel (gui.DenLayersPanel).

A long animation is cut to --max-frames frames spread over its loop (each shown longer), and to as many as
fit a 2048 x 2048 sheet; frames the same as the one before are merged.

Each item's result is saved as it is made (animate.progress.jsonl, next to pack.json), so a run that is
stopped carries on where it left off when started again, as long as pack.json has not changed since
(convert.py run again). --fresh starts over. The file is removed when a run finishes.
"""
import argparse, collections, io, json, math, os, shutil, subprocess, sys, tempfile, base64
from multiprocessing import Pool
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = 2048
A = None


def render_at(ops, images):
    """lprender.render_ops without its crop: (canvas, x0, y0), the canvas's top left in node space"""
    xs, ys = [], []
    for fn, m, a in ops:
        w, h = images[fn].size
        for px, py in ((0, 0), (w, 0), (0, h), (w, h)):
            xs.append(m[0] * px + m[2] * py + m[4])
            ys.append(m[1] * px + m[3] * py + m[5])
    x0, y0, x1, y1 = math.floor(min(xs)), math.floor(min(ys)), math.ceil(max(xs)), math.ceil(max(ys))
    W, H = max(1, x1 - x0), max(1, y1 - y0)
    if W * H > 4000 * 4000:
        return None, 0, 0
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for fn, m, a in ops:
        img = images[fn]
        m2 = (m[0], m[1], m[2], m[3], m[4] - x0, m[5] - y0)
        det = m2[0] * m2[3] - m2[1] * m2[2]
        if abs(det) < 1e-6:
            continue
        if a < 1:
            img = img.copy()
            img.putalpha(img.getchannel('A').point(lambda v, a=a: int(v * a)))
        ia, ib, ic, id_ = m2[3] / det, -m2[1] / det, -m2[2] / det, m2[0] / det
        ie, if_ = -(ia * m2[4] + ic * m2[5]), -(ib * m2[4] + id_ * m2[5])
        if m2[1] == 0 and m2[2] == 0 and m2[0] == 1 and m2[3] == 1 and round(m2[4]) >= 0 and round(m2[5]) >= 0:
            canvas.alpha_composite(img, (round(m2[4]), round(m2[5])))
        else:
            canvas.alpha_composite(img.transform((W, H), Image.AFFINE, (ia, ic, ie, ib, id_, if_), resample=Image.BILINEAR))
    return canvas, x0, y0


def timing(ent):
    """(frames in the loop, ms a frame), as the viewer's player works it out"""
    ani, info = ent.get('ani'), ent.get('info') or {}
    frames, ft = 1, 33
    for r in info.get('anims') or []:
        s = (ani or {}).get('symbols', {}).get(r['sym'])
        if s:
            frames, ft = max(frames, s.get('frames') or 1), s.get('ft') or ft
    return min(frames, 5000), max(10, ft)


def scaled(im, scale):
    if abs(scale - 1.0) < 1e-6:
        return im
    return im.convert('RGBa').resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS).convert('RGBA')


def do_item(job):
    """one item: (key, anim dict or None, sound path or None, note)"""
    import lprender
    item, ent, no_anim = job
    key, flags, scale = item['key'], item.get('flags', []), item['source']['scale']
    out_anim = out_sound = None
    notes = []
    files = ent['files']
    # its music
    oggs = sorted((f for f, v in files.items() if f.lower().endswith('.ogg') and isinstance(v, str) and ',' in v), key=lambda f: (f != 'BGM.ogg', f))
    if oggs:
        rel = f'sounds/{key}.mp3'
        dst = os.path.join(A.pack, rel)
        with tempfile.TemporaryDirectory() as tmp:
            src = os.path.join(tmp, 'in.ogg')
            open(src, 'wb').write(base64.b64decode(files[oggs[0]].split(',', 1)[1]))
            r = subprocess.run([A.ffmpeg, '-y', '-loglevel', 'error', '-i', src, '-vn', '-codec:a', 'libmp3lame', '-q:a', '5', '-ar', '44100', dst],
                               capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(dst):
            out_sound = rel
        else:
            notes.append('music not converted: ' + (r.stderr or '').strip()[:100])
    # its animation
    ani = ent.get('ani')
    n_loop, ft = timing(ent)
    if ani and not no_anim and 'animation-left-out' not in flags and n_loop > 1:
        imgs = {f: Image.open(io.BytesIO(base64.b64decode(v.split(',', 1)[1]))).convert('RGBA')
                for f, v in files.items() if isinstance(v, str) and v.startswith('data:image')}
        sizes = {f: im.size for f, im in imgs.items()}
        d = 'fr' if 'front-right-picture' in flags else 'fl'
        names = set(files)

        def frame(f):
            ops = lprender.frame_ops(ent['info'], ani, names, sizes, d, f)
            return render_at(ops, imgs) if ops else (None, 0, 0)

        # the picture convert.py made: frame 0, cropped to what is drawn
        c0, x0, y0 = frame(0)
        if c0 is None or not c0.getbbox():
            return key, None, out_sound, notes + ['frame 0 draws nothing']
        # which frames: up to max-frames spread over the loop
        n = min(n_loop, A.max_frames)
        starts = sorted({(k * n_loop) // n for k in range(n)})
        rendered = [(0, (c0, x0, y0))] + [(f, frame(f)) for f in starts if f]
        rendered = [(f, r) for f, r in rendered if r[0] is not None]
        # the box every frame fits in, in node space
        boxes = [(x + b[0], y + b[1], x + b[2], y + b[3]) for f, (c, x, y) in rendered for b in [c.getbbox()] if b]
        ul, ut = min(b[0] for b in boxes), min(b[1] for b in boxes)
        ur, ub = max(b[2] for b in boxes), max(b[3] for b in boxes)
        cells = []
        for i, (f, (c, x, y)) in enumerate(rendered):
            cell = Image.new('RGBA', (ur - ul, ub - ut), (0, 0, 0, 0))
            cell.paste(c, (x - ul, y - ut), c)  # the cell is empty: pasting is compositing
            nxt = rendered[i + 1][0] if i + 1 < len(rendered) else n_loop
            cells.append([scaled(cell, scale), (nxt - f) * ft])
        # same as the one before: one frame, shown longer
        merged = []
        for im, ms in cells:
            if merged and merged[-1][0].tobytes() == im.tobytes():
                merged[-1][1] += ms
            else:
                merged.append([im, ms])
        cw, ch = merged[0][0].size
        if len(merged) > 1 and cw <= SHEET and ch <= SHEET:
            cols = max(1, min(len(merged), SHEET // cw))
            fit = cols * (SHEET // ch)
            if len(merged) > fit:  # keep as many as fit, spread over the loop
                keep = sorted({(k * len(merged)) // fit for k in range(fit)})
                merged = [[merged[k][0], sum(ms for _, ms in merged[k:(keep[j + 1] if j + 1 < len(keep) else len(merged))])] for j, k in enumerate(keep)]
                notes.append(f'cut to {len(merged)} frames to fit the sheet')
            rows = math.ceil(len(merged) / cols)
            sheet = Image.new('RGBA', (cols * cw, rows * ch), (0, 0, 0, 0))
            for k, (im, _) in enumerate(merged):
                sheet.paste(im, ((k % cols) * cw, (k // cols) * ch))
            rel = f'anims/{key}.png'
            sheet.save(os.path.join(A.pack, rel), 'PNG', compress_level=6)
            # the item's picture becomes the first frame exactly (resized on the same grid), so nothing moves
            # when the animation starts or stops
            first = merged[0][0]
            bb = first.getbbox()
            first.crop(bb).save(os.path.join(A.pack, item['image']), 'PNG', optimize=True)
            out_anim = {'image': rel, 'frames': len(merged), 'cols': cols, 'w': cw, 'h': ch, 'x': -bb[0], 'y': -bb[1],
                        'ms': [max(10, round(ms)) for _, ms in merged], 'picture': [bb[2] - bb[0], bb[3] - bb[1]]}
        elif len(merged) > 1:
            notes.append(f'frames too big for a sheet ({cw}x{ch})')
    return key, out_anim, out_sound, notes


def init(a):
    global A
    A = a
    sys.path.insert(0, os.path.join(a.viewer, 'tools'))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('pack')
    ap.add_argument('--viewer', default=r'D:\lineplay_viewer')
    ap.add_argument('--max-frames', type=int, default=64)
    ap.add_argument('--only', default='')
    ap.add_argument('--workers', type=int, default=3)
    ap.add_argument('--ffmpeg', default=shutil.which('ffmpeg') or 'ffmpeg')
    ap.add_argument('--fresh', action='store_true', help='start over, not where a stopped run left off')
    a = ap.parse_args()
    init(a)
    pj = os.path.join(a.pack, 'pack.json')
    pack = json.load(open(pj, encoding='utf-8'))
    # a stopped run's results, if it was on this same pack.json
    st = os.stat(pj)
    stamp = f'{st.st_size}:{st.st_mtime_ns}'
    prog = os.path.join(a.pack, 'animate.progress.jsonl')
    saved = {}
    only = set(filter(None, a.only.split(',')))
    if not only and not a.fresh and os.path.exists(prog):
        with open(prog, encoding='utf-8') as f:
            lines = f.read().split('\n')
        try:
            same = json.loads(lines[0]).get('pack') == stamp
        except ValueError:
            same = False
        if same:
            for line in lines[1:]:
                try:
                    key, anim, sound, item_notes = json.loads(line)
                except ValueError:
                    continue  # empty, or cut short when the run was stopped
                if (not anim or os.path.exists(os.path.join(a.pack, anim['image']))) and \
                        (not sound or os.path.exists(os.path.join(a.pack, sound))):
                    saved[key] = (key, anim, sound, item_notes)
            print(f'carrying on: {len(saved)} items done before', flush=True)
        else:
            print('pack.json changed since the stopped run: starting over', flush=True)
    cmap = json.load(open(os.path.join(HERE, 'category_map.json'), encoding='utf8'))
    man = open(os.path.join(a.viewer, 'data', 'manifest.js'), encoding='utf-8').read()
    M = json.loads(man[man.index('(') + 1: man.rindex(')')])
    by_key = {f"{it['c']}:{it['id']}": it for it in M['items']}
    for d in ('anims', 'sounds'):
        if not only and not saved and os.path.isdir(os.path.join(a.pack, d)):
            shutil.rmtree(os.path.join(a.pack, d))
        os.makedirs(os.path.join(a.pack, d), exist_ok=True)
    if not only and not saved:
        with open(prog, 'w', encoding='utf-8') as f:
            f.write(json.dumps({'pack': stamp}) + '\n')
    wanted = collections.defaultdict(list)
    for item in pack['items']:
        if only and item['key'] not in only:
            continue
        if not only:
            item.pop('anim', None)
            item.pop('sound', None)
        it = by_key.get(f"{item['source']['collection']}:{item['source']['id']}")
        if it and (it.get('anim') or it.get('snd')):
            wanted[it['p']].append((item, it))

    def jobs():
        for p in sorted(wanted):
            txt = open(os.path.join(a.viewer, 'data', 'packs', M['packs'][p] + '.js'), encoding='utf-8').read()
            vp = json.loads(txt[txt.index(',') + 1: txt.rindex(')')])
            for item, it in wanted[p]:
                if item['key'] in saved:
                    continue
                ent = vp.get(f"{it['c']}:{it['id']}")
                if ent and ent.get('info'):
                    pre = cmap['prefixes'].get(it['id'][:4], {})
                    yield item, {k: ent[k] for k in ('files', 'info', 'ani') if k in ent}, bool(pre.get('noAnimation'))

    by_item = {item['key']: item for item in pack['items']}
    total = sum(len(v) for v in wanted.values())
    done = anims = sounds = 0
    notes = collections.Counter()
    examples = collections.defaultdict(list)
    log = open(prog, 'a', encoding='utf-8') if not only else None

    def results(pool):
        yield from saved.values()
        for result in pool.imap_unordered(do_item, jobs(), chunksize=2):
            if log:
                log.write(json.dumps(result) + '\n')
                log.flush()
            yield result

    with Pool(a.workers, initializer=init, initargs=(a,)) as pool:
        for key, anim, sound, item_notes in results(pool):
            done += 1
            if anim:
                item = by_item[key]
                item['width'], item['height'] = anim.pop('picture')
                item['so'] = min(item['so'], round(item['height'] * 0.85))
                item['anim'] = anim
                anims += 1
            if sound:
                by_item[key]['sound'] = sound
                sounds += 1
            for n in item_notes:
                kind = n.split(' (')[0].split(':')[0]
                notes[kind] += 1
                if len(examples[kind]) < 5:
                    examples[kind].append(f'{key}: {n}'[:140])
            if done % 100 == 0:
                print(f'{done}/{total}', flush=True)
    tmp = pj + '.tmp'
    with open(tmp, 'w', encoding='utf8') as f:
        json.dump(pack, f, ensure_ascii=False, indent=1)
    os.replace(tmp, pj)
    if log:
        log.close()
        os.remove(prog)
    print(f'{total} items looked at: {anims} animations, {sounds} with music')
    for kind, n in notes.most_common():
        print(f'  {kind}: {n}, e.g. {examples[kind]}')


if __name__ == '__main__':
    main()
