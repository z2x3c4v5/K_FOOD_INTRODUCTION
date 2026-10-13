"""Re-download the curated photographs without changing their selection or credits.
Requires Node.js, Python and Pillow. Run from any directory.
"""
import concurrent.futures
import io
import json
import subprocess
import urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = 'KFoodClassroom/1.0 (https://github.com/z2x3c4v5/K_FOOD_INTRODUCTION; educational photo attribution)'

def download(credit):
    request = urllib.request.Request(credit['original'], headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        image = Image.open(io.BytesIO(response.read())).convert('RGB')
    image.thumbnail((800, 600))
    path = ROOT / credit['path']
    temporary = path.with_suffix('.tmp')
    image.save(temporary, format='JPEG', quality=85, optimize=True)
    temporary.replace(path)
    print('OK', credit['key'], flush=True)

if __name__ == '__main__':
    credits = json.loads((ROOT / 'assets/foods/credits.json').read_text())
    food_keys = json.loads(subprocess.check_output(['node', '-e', "const fs=require('fs'),vm=require('vm'); console.log(JSON.stringify(vm.runInNewContext(fs.readFileSync('data.js','utf8')+'; FOODS.map(f=>f.key)')))"], cwd=ROOT))
    if set(food_keys) != {c['key'] for c in credits}:
        raise ValueError('Every food needs a curated photo and credit entry before refreshing.')
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(download, credits))
