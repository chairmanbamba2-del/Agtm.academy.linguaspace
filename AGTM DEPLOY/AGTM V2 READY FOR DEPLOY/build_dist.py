#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build script: copie les fichiers validés dans /dist et archive les fichiers corrompus"""
import shutil, os, sys

os.makedirs('dist', exist_ok=True)
os.makedirs('dist/agtm-premium-design', exist_ok=True)
os.makedirs('dist/icons', exist_ok=True)
os.makedirs('archive', exist_ok=True)

files = [
    ('dashboard-premium-lot2-final.html', 'dist/dashboard.html'),
    ('index.html', 'dist/index.html'),
    ('login.html', 'dist/login.html'),
    ('inscription.html', 'dist/inscription.html'),
    ('sw.js', 'dist/sw.js'),
    ('manifest.json', 'dist/manifest.json'),
    ('netlify.toml', 'dist/netlify.toml'),
    ('agtm-premium-design/design-tokens.css', 'dist/agtm-premium-design/design-tokens.css'),
    ('agtm-premium-design/components.css', 'dist/agtm-premium-design/components.css'),
    ('agtm-premium-design/ai-validation-dashboard.html', 'dist/agtm-premium-design/ai-validation-dashboard.html'),
]

print("=== BUILD DIST ===")
for src, dst in files:
    if os.path.exists(src):
        shutil.copy2(src, dst)
        size = os.path.getsize(dst)
        print(f"  OK  {src} -> {dst} ({size:,} bytes)")
    else:
        print(f"  ABSENT  {src}")

# Icones
if os.path.exists('icons'):
    for f in os.listdir('icons'):
        shutil.copy2(f'icons/{f}', f'dist/icons/{f}')
    print(f"  OK  icons/ ({len(os.listdir('icons'))} fichiers)")

# Archiver le fichier corrompu
corrupt = 'dashboard-premium-lot2.html'
if os.path.exists(corrupt):
    shutil.move(corrupt, 'archive/dashboard-premium-lot2-CORROMPU.html')
    print(f"  ARCHIVE  {corrupt} -> archive/")
else:
    print(f"  INFO  {corrupt} deja archive ou absent")

print()
print("=== CONTENU /dist ===")
total = 0
for root, dirs, files2 in os.walk('dist'):
    for f in files2:
        fp = os.path.join(root, f)
        sz = os.path.getsize(fp)
        total += sz
        print(f"  {fp.replace('dist/', '')} ({sz:,} bytes)")
print(f"\nTotal: {total:,} bytes ({total/1024/1024:.2f} MB)")
print("BUILD OK")
