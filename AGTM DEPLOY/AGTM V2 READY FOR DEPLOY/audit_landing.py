#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, sys

c = open('index.html','rb').read().decode('utf-8','replace')
sys.stdout.write('SIZE: ' + str(len(c)) + '\n')
sys.stdout.write('supabase: ' + str('supabase' in c.lower()) + '\n')
sys.stdout.write('chatbot: ' + str('chatbot' in c.lower()) + '\n')
sys.stdout.write('assistante-ia: ' + str('assistante-ia' in c.lower()) + '\n')
sys.stdout.write('manifest: ' + str('manifest.json' in c) + '\n')
sys.stdout.write('serviceWorker: ' + str('serviceWorker' in c) + '\n')
sys.stdout.write('viewport: ' + str('viewport' in c) + '\n')
sys.stdout.write('@media: ' + str('@media' in c) + '\n')
sys.stdout.write('beforeinstallprompt: ' + str('beforeinstallprompt' in c) + '\n')
sys.stdout.write('technolog: ' + str('technolog' in c.lower()) + '\n')
sys.stdout.write('guide_utilisation exists: ' + str(os.path.exists('guide_utilisation.html')) + '\n')
sys.stdout.write('presentation exists: ' + str(os.path.exists('presentation_agtm_digital_academy.html')) + '\n')
g = open('guide_utilisation.html','rb').read().decode('utf-8','replace') if os.path.exists('guide_utilisation.html') else ''
sys.stdout.write('guide size: ' + str(len(g)) + '\n')
p = open('presentation_agtm_digital_academy.html','rb').read().decode('utf-8','replace') if os.path.exists('presentation_agtm_digital_academy.html') else ''
sys.stdout.write('presentation size: ' + str(len(p)) + '\n')
sys.stdout.flush()
