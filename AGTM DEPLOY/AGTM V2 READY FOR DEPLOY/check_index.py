#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, re
c = open('index.html','rb').read().decode('utf-8','replace')
sys.stdout.write('serviceWorker: ' + str(c.count('serviceWorker')) + '\n')
sys.stdout.write('aiChatToggle: ' + str(c.count('aiChatToggle')) + '\n')
sys.stdout.write('_loadMarketingStats: ' + str(c.count('_loadMarketingStats')) + '\n')
sys.stdout.write('beforeinstallprompt: ' + str(c.count('beforeinstallprompt')) + '\n')
sys.stdout.write('manifest.json: ' + str(c.count('manifest.json')) + '\n')
sys.stdout.write('Avantages Concurrentiels: ' + str(c.count('Avantages Concurrentiels')) + '\n')
scripts_open = len(re.findall(r'<script[^>]*>', c))
scripts_close = c.count('</script>')
sys.stdout.write('script open: ' + str(scripts_open) + '\n')
sys.stdout.write('script close: ' + str(scripts_close) + '\n')
sys.stdout.write('Taille: ' + str(len(c)) + '\n')
sys.stdout.flush()
