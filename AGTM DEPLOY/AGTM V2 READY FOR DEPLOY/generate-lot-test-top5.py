#!/usr/bin/env python3
"""
Script de génération du Lot Test "Top 5"
Appelle l'Edge Function generate-module-content pour les 5 thèmes prioritaires
et insère les modules générés dans la table seances avec statut 'draft'
"""

import os
import sys
import json
import asyncio
import aiohttp
from datetime import datetime, timedelta
import uuid

# Configuration Supabase
SUPABASE_URL = "https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
EDGE_FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/generate-module-content"

# Thèmes prioritaires du Lot Test "Top 5"
TOP5_THEMES = [
    {
        "module_id": "biz_b2_m1",
        "topic": "Business English: Réussir sa première réunion internationale",
        "level": "B2",
        "theme": "business",
        "description": "Module premium pour les professionnels francophones devant participer à des réunions internationales en anglais. Focus sur le vocabulaire spécifique, les expressions clés et les stratégies de communication interculturelle."
    },
    {
        "module_id": "exam_c1_m1",
        "topic": "TOEFL Prep: Stratégies pour la section 'Speaking'",
        "level": "C1",
        "theme": "preparation_examen",
        "description": "Module intensif pour maximiser le score TOEFL Speaking. Techniques de réponse structurée, gestion du temps, prononciation et exemples de réponses haute performance."
    },
    {
        "module_id": "gram_b2_m1",
        "topic": "Grammar Pro: Maîtriser les nuances du Present Perfect",
        "level": "B2",
        "theme": "grammaire",
        "description": "Approfondissement avancé du Present Perfect avec focus sur les nuances qui distinguent les locuteurs intermédiaires des experts. Cas complexes et exceptions."
    },
    {
        "module_id": "biz_b2_m2",
        "topic": "Professional Writing: Rédiger des emails percutants en 2026",
        "level": "B2",
        "theme": "business",
        "description": "Module actualisé pour l'écriture professionnelle moderne. Templates d'emails efficaces, ton adapté aux nouvelles normes de communication digitale, et optimisation pour les outils IA."
    },
    {
        "module_id": "tech_b2_m1",
        "topic": "Technical English: Vocabulaire de l'IA et du développement logiciel",
        "level": "B2",
        "theme": "vocabulaire",
        "description": "Vocabulaire technique essentiel pour les développeurs et professionnels du numérique. Termes spécifiques à l'IA, au machine learning, aux frameworks modernes et à l'architecture logicielle."
    }
]

async def generate_module(session, module_data):
    """Appelle l'Edge Function pour générer un module"""
    print(f"🔍 Génération du module: {module_data['module_id']} - {module_data['topic']}")
    
    payload = {
        "module_id": module_data["module_id"],
        "topic": module_data["topic"],
        "level": module_data["level"],
        "theme": module_data["theme"],
        "language": "fr"
    }
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}"
        }
        
        async with session.post(EDGE_FUNCTION_URL, json=payload, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Module généré: {module_data['module_id']} ({len(data.get('content', {}))} caractères)")
                return {
                    "success": True,
                    "module_data": module_data,
                    "generated_content": data.get("content"),
                    "raw_response": data
                }
            else:
                error_text = await response.text()
                print(f"❌ Erreur génération {module_data['module_id']}: {response.status} - {error_text}")
                return {
                    "success": False,
                    "module_data": module_data,
                    "error": f"HTTP {response.status}: {error_text}"
                }
                
    except Exception as e:
        print(f"❌ Exception génération {module_data['module_id']}: {str(e)}")
        return {
            "success": False,
            "module_data": module_data,
            "error": str(e)
        }

async def insert_into_seances(session, module_result):
    """Insère le module généré dans la table seances avec statut 'draft'"""
    if not module_result["success"]:
        print(f"⚠ Impossible d'insérer {module_result['module_data']['module_id']}: génération échouée")
        return False
    
    module_data = module_result["module_data"]
    generated_content = module_result["generated_content"]
    
    # Structure de la table seances (basée sur l'audit précédent)
    seance_data = {
        "sujet": module_data["topic"],
        "date_seance": (datetime.now() + timedelta(days=7)).isoformat(),  # 7 jours dans le futur
        "heure_debut": "09:00",
        "heure_fin": "10:30",
        "statut": "draft",
        "format": "module_ia",
        "programme": "AGTM Digital Academy - Lot Test Top 5",
        "module_id": module_data["module_id"],
        "chapitre": "Module IA Généré",
        "categorie": module_data["theme"],
        "notes": module_data["description"],
        "ai_generated_content": json.dumps(generated_content, ensure_ascii=False) if generated_content else None,
        "session_status": "draft",
        "wizard_step": 1,
        "duration_minutes": 45,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # URL Supabase pour la table seances
    seances_url = f"{SUPABASE_URL}/rest/v1/seances"
    
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "apikey": SUPABASE_ANON_KEY,
            "Prefer": "return=representation"
        }
        
        async with session.post(seances_url, json=seance_data, headers=headers) as response:
            if response.status in [200, 201]:
                inserted_data = await response.json()
                print(f"✅ Module inséré dans seances: {module_data['module_id']} (ID: {inserted_data[0].get('id', 'N/A')})")
                return True
            else:
                error_text = await response.text()
                print(f"❌ Erreur insertion {module_data['module_id']}: {response.status} - {error_text}")
                return False
                
    except Exception as e:
        print(f"❌ Exception insertion {module_data['module_id']}: {str(e)}")
        return False

async def main():
    """Fonction principale"""
    print("=" * 60)
    print("🚀 LOT TEST 'TOP 5' - GÉNÉRATION ET INSERTION")
    print("=" * 60)
    print()
    
    # Vérification de la clé API
    if not SUPABASE_ANON_KEY:
        print("❌ ERREUR: SUPABASE_ANON_KEY non définie dans les variables d'environnement")
        print("   Exécutez: export SUPABASE_ANON_KEY='votre_cle_ici'")
        return 1
    
    print(f"📊 Thèmes à générer: {len(TOP5_THEMES)}")
    for i, theme in enumerate(TOP5_THEMES, 1):
        print(f"  {i}. {theme['module_id']}: {theme['topic']}")
    print()
    
    # Création de la session HTTP
    async with aiohttp.ClientSession() as session:
        # Génération des modules
        print("🔄 Génération des modules via Edge Function...")
        generation_tasks = [generate_module(session, theme) for theme in TOP5_THEMES]
        generation_results = await asyncio.gather(*generation_tasks)
        
        # Analyse des résultats de génération
        successful_generations = [r for r in generation_results if r["success"]]
        failed_generations = [r for r in generation_results if not r["success"]]
        
        print()
        print("📈 RÉSULTATS DE GÉNÉRATION:")
        print(f"  ✅ Succès: {len(successful_generations)}/{len(TOP5_THEMES)}")
        print(f"  ❌ Échecs: {len(failed_generations)}/{len(TOP5_THEMES)}")
        
        if failed_generations:
            print()
            print("📋 Détails des échecs:")
            for fail in failed_generations:
                print(f"  • {fail['module_data']['module_id']}: {fail.get('error', 'Erreur inconnue')}")
        
        # Insertion dans la table seances
        if successful_generations:
            print()
            print("🔄 Insertion dans la table 'seances'...")
            insertion_tasks = [insert_into_seances(session, result) for result in successful_generations]
            insertion_results = await asyncio.gather(*insertion_tasks)
            
            successful_insertions = sum(insertion_results)
            print()
            print("📈 RÉSULTATS D'INSERTION:")
            print(f"  ✅ Insertions réussies: {successful_insertions}/{len(successful_generations)}")
        
        # Génération du rapport
        print()
        print("=" * 60)
        print("📋 RAPPORT FINAL - LOT TEST 'TOP 5'")
        print("=" * 60)
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_themes": len(TOP5_THEMES),
            "successful_generations": len(successful_generations),
            "failed_generations": len(failed_generations),
            "successful_insertions": successful_insertions if 'successful_insertions' in locals() else 0,
            "themes": []
        }
        
        for i, theme in enumerate(TOP5_THEMES):
            gen_result = generation_results[i]
            theme_report = {
                "module_id": theme["module_id"],
                "topic": theme["topic"],
                "generation_success": gen_result["success"],
                "insertion_success": insertion_results[i] if successful_generations else False,
                "error": gen_result.get("error") if not gen_result["success"] else None
            }
            report["themes"].append(theme_report)
            
            # Affichage détaillé
            status_icon = "✅" if gen_result["success"] else "❌"
            print(f"{status_icon} {theme['module_id']}: {theme['topic']}")
            if gen_result["success"]:
                print(f"   → Génération: OK | Insertion: {'OK' if insertion_results[i] else 'Échec'}")
            else:
                print(f"   → Erreur: {gen_result.get('error', 'Inconnue')}")
        
        # Sauvegarde du rapport
        report_filename = f"lot-test-top5-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print()
        print(f"📄 Rapport sauvegardé: {report_filename}")
        
        # Recommandations
        print()
        print("🎯 RECOMMANDATIONS:")
        if len(successful_generations) == len(TOP5_THEMES):
            print("  • Tous les modules ont été générés avec succès!")
            print("  • Vérifiez le Dashboard de Validation IA pour les réviser")
            print("  • Publiez les modules après validation pédagogique")
        else:
            print("  • Certains modules ont échoué, vérifiez les logs ci-dessus")
            print("  • Vérifiez la connexion à l'Edge Function et la clé API")
            print("  • Relancez le script pour les modules échoués")
        
        print()
        print("🚀 EXÉCUTION TERMINÉE")
        
        return 0 if len(successful_generations) == len(TOP5_THEMES) else 1

if __name__ == "__main__":
    # Configuration pour Windows (asyncio)
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    exit_code = asyncio.run(main())
    sys.exit(exit_code)