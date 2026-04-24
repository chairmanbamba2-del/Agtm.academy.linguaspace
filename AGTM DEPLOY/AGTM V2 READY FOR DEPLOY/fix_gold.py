#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remplace toutes les occurrences de #E8941A par #D4A017 dans le dashboard"""
import sys

fname = 'dashboard-premium-lot2-final.html'
with open(fname, 'rb') as f:
    raw = f.read()

content = raw.decode('utf-8', errors='replace')
before = content.count('#E8941A')
content = content.replace('#E8941A', '#D4A017')
after = content.count('#E8941A')

with open(fname, 'wb') as f:
    f.write(content.encode('utf-8'))

sys.stdout.write(f"Avant: {before} occurrences #E8941A\n")
sys.stdout.write(f"Apres: {after} occurrences #E8941A\n")
sys.stdout.write("Remplacement OK\n")
sys.stdout.flush()
