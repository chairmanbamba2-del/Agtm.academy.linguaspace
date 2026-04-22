#!/usr/bin/env python3
# Script pour corriger les problèmes d'encodage dans Landing.jsx

import re

# Mapping des caractères mal encodés vers les caractères corrects
encoding_fixes = {
    # Caractères français mal encodés
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã§': 'ç',
    'Ã ': 'à',
    'Ã´': 'ô',
    'Ã»': 'û',
    'Ã®': 'î',
    'Ã¯': 'ï',
    'Ã¹': 'ù',
    'Ã¢': 'â',
    'Ã«': 'ë',
    'Ã¤': 'ä',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'Ã±': 'ñ',
    'Ã€': 'À',
    'Ã‰': 'É',
    'Ãˆ': 'È',
    'Ã‡': 'Ç',
    'Ã“': 'Ó',
    'Ãœ': 'Ü',
    
    # Symboles et flèches mal encodés
    'â†’': '→',
    'â€”': '—',
    'â€¦': '…',
    'â€¢': '•',
    'â€˜': '‘',
    'â€™': '’',
    'â€œ': '“',
    'â€': '”',
    'â€¡': '‡',
    'â€º': '›',
    'â€¹': '‹',
    'â€¼': '›',
    'â€½': '›',
    'â€¾': '›',
    'â€¿': '›',
    'â€˜': '‘',
    'â€™': '’',
    'â€œ': '“',
    'â€': '”',
    
    # Émojis mal encodés
    'ðŸ‡¬ðŸ‡§': '🇬🇧',
    'ðŸ‡ªðŸ‡¸': '🇪🇸',
    'ðŸ‡©ðŸ‡ª': '🇩🇪',
    'ðŸ‡«ðŸ‡·': '🇫🇷',
    'ðŸ—£ï¸': '🗣️',
    'ðŸ’¼': '💼',
    'ðŸŽ­': '🎭',
    'ðŸŽ¯': '🎯',
    'ðŸ¤–': '🤖',
    'ðŸ˜Š': '😊',
    'ðŸ”’': '🔗',
    'ðŸŸ ': '🟠',
    'ðŸ”µ': '🔵',
    'ðŸŸ¡': '🟡',
    'ðŸ’³': '💳',
    'ðŸŒ': '🌍',
    'ðŸ“±': '📱',
    'ðŸ“²': '📲',
    'ðŸŽ': '🍏',
    'â—': '●',
    'âœï¸': '✔️',
    'âœ¦': '✓',
    
    # Autres caractères spéciaux
    'Â·': '·',
    'Â©': '©',
    'Â®': '®',
    'Â°': '°',
    'Â±': '±',
    'Â²': '²',
    'Â³': '³',
    'Âµ': 'µ',
    'Â·': '·',
    'Â»': '»',
    'Â«': '«',
    'Â¢': '¢',
    'Â£': '£',
    'Â¥': '¥',
    'Â§': '§',
    'Â©': '©',
    'Âª': 'ª',
    'Â«': '«',
    'Â¬': '¬',
    'Â®': '®',
    'Â¯': '¯',
    'Â°': '°',
    'Â±': '±',
    'Â²': '²',
    'Â³': '³',
    'Â´': '´',
    'Âµ': 'µ',
    'Â¶': '¶',
    'Â·': '·',
    'Â¸': '¸',
    'Â¹': '¹',
    'Âº': 'º',
    'Â»': '»',
    'Â¼': '¼',
    'Â½': '½',
    'Â¾': '¾',
    'Â¿': '¿',
    
    # Corrections spécifiques pour les mots français
    'MaÃ®trisez': 'Maîtrisez',
    'RincÃ³n': 'Rincón',
    'EspaÃ±ol': 'Español',
    'TÃ©lÃ©vision': 'Télévision',
    'MÃ©xico': 'México',
    'aprÃ¨s': 'après',
    'ActualitÃ©': 'Actualité',
    'opportunitÃ©s': 'opportunités',
    'littÃ©rature': 'littérature',
    'franÃ§ais': 'français',
    'PropulsÃ©': 'Propulsé',
    'conversation': 'conversation',  # déjà correct
    'RÃ©unions': 'Réunions',
    'prÃ©sentations': 'présentations',
    'rÃ´le': 'rôle',
    'scÃ©narios': 'scénarios',
    'Parcours': 'Parcours',  # déjà correct
    'structurÃ©': 'structuré',
    'jusquÃ ': 'jusqu\'à',
    'jusquÃ\xa0': 'jusqu\'à',
    'dÃ¨s': 'dès',
    'engagement': 'engagement',  # déjà correct
    'Ã ': 'à',
    'long': 'long',  # déjà correct
    'terme': 'terme',  # déjà correct
    'RÃ©siliez': 'Résiliez',
    'vidÃ©o': 'vidéo',
    'illimitÃ©': 'illimité',
    'dÃ©taillÃ©': 'détailé',
    'sÃ©curisÃ©': 'sécurisé',
    'tÃ©lÃ©phone': 'téléphone',
    'tÃ©lÃ©chargement': 'téléchargement',
    'Ã©cran': 'écran',
    'accueil': 'accueil',  # déjà correct
}

def fix_encoding(text):
    """Corrige les problèmes d'encodage dans le texte"""
    for wrong, correct in encoding_fixes.items():
        text = text.replace(wrong, correct)
    return text

def main():
    # Lire le fichier original
    with open('src/pages/Landing.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Appliquer les corrections
    fixed_content = fix_encoding(content)
    
    # Écrire le fichier corrigé
    with open('src/pages/Landing.jsx', 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print("Fichier corrigé avec succès!")

if __name__ == '__main__':
    main()