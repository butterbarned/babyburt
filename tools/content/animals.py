"""
Animal outlines for the content pack preview (tools/content/preview.js): every
AJ animal standing, at its size in a den, to set den items beside.

    python tools/content/animals.py <applejack tools dir> [--cache DIR] [--out DIR]

    <applejack tools dir>  the folder with mirror_assets.py and composite_avatar.py
                           (e.g. D:/applejack_gifs)
    --cache DIR            where those tools keep what they download
                           (default content-packs/_animals/cache)
    --out DIR              default content-packs/_animals (beside the packs, so a
                           pack's preview finds it at ../_animals)

It downloads (once) the game's definitions and each animal's two standing poses
(animation categories 3, side on, and 4, three-quarters to the front), draws
them with composite_avatar.py at scale 1 (the size the game draws them: a
bunny is about 58 x 93), and writes <out>/<pose>/<id>.png and <out>/animals.json:
[{id, name, poses: {side: {file, w, h}, front: {...}}}].
These are the game's own pictures: content-packs/ is not in the repository.
"""
import argparse, json, os, shutil, subprocess, sys, tempfile

POSES = {'side': 3, 'front': 4}
BUILD = '1830'


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('tools')
    ap.add_argument('--cache', default=os.path.join('content-packs', '_animals', 'cache'))
    ap.add_argument('--out', default=os.path.join('content-packs', '_animals'))
    a = ap.parse_args()
    tools = os.path.abspath(a.tools)
    cache = os.path.abspath(a.cache)
    out = os.path.abspath(a.out)
    for script in ('mirror_assets.py', 'composite_avatar.py'):
        if not os.path.isfile(os.path.join(tools, script)):
            sys.exit(f'no {script} in {tools}')
    run = lambda *args: subprocess.run([sys.executable, *args], cwd=tools, check=True)

    print('downloading definitions and standing poses (only what is missing)...')
    run('mirror_assets.py', '--types', 'defs', '--out', cache, '--build', BUILD)
    run('mirror_assets.py', '--types', 'avatars', *sum((['--category', str(c)] for c in POSES.values()), []),
        '--out', cache, '--build', BUILD)

    work = tempfile.mkdtemp(prefix='animals-')
    try:
        run('composite_avatar.py', '--avatar', 'all', *sum((['--category', str(c)] for c in POSES.values()), []),
            '--scale', '1', '--cache', cache, '--build', BUILD, '--out', work)
        # the animals' names, from the tools' own reading of the defs
        sys.path.insert(0, tools)
        import composite_avatar
        data = composite_avatar.Data(cache, BUILD)
        names = data.pack(10230)

        def name_of(row):
            entry = names.get(str(row.get('titleStrRef'))) or names.get(row.get('titleStrRef'))
            return (entry.get('str') or entry.get('s')) if isinstance(entry, dict) else (entry or f"Animal {row['id']}")

        animals = []
        for pose in POSES:
            os.makedirs(os.path.join(out, pose), exist_ok=True)
        for avatar_id, row in sorted(data.avatars.items()):
            entry = {'id': avatar_id, 'name': name_of(row), 'poses': {}}
            for pose, cat in POSES.items():
                frame = os.path.join(work, f'avatar{avatar_id}_cat{cat}', 'frame00.png')
                if not os.path.isfile(frame):
                    continue
                meta = json.load(open(os.path.join(work, f'avatar{avatar_id}_cat{cat}', 'meta.json'), encoding='utf8'))
                first = meta['frames'][0]
                dest = os.path.join(out, pose, f'{avatar_id}.png')
                shutil.copyfile(frame, dest)
                entry['poses'][pose] = {'file': f'{pose}/{avatar_id}.png', 'w': first['w'], 'h': first['h']}
            if entry['poses']:
                animals.append(entry)
    finally:
        shutil.rmtree(work, ignore_errors=True)
    animals.sort(key=lambda entry: entry['name'])
    with open(os.path.join(out, 'animals.json'), 'w', encoding='utf8') as f:
        json.dump(animals, f, ensure_ascii=False, indent=1)
    print(f'{len(animals)} animals -> {out}')


if __name__ == '__main__':
    main()
