#!/usr/bin/env python3
"""
TEST SUITE COMPLETA PER SISTEMA AI ULTRA-ENHANCED CLAS2E
=======================================================

Script di test completo per verificare tutte le funzionalità
del sistema AI ultra-enhanced integrato in clas2e.
"""

import asyncio
import aiohttp
import json
import time
from typing import Dict, List, Any
import matplotlib.pyplot as plt
import pandas as pd
from datetime import datetime

class Clas2eAITester:
    """Tester completo per il sistema AI ultra-enhanced di clas2e"""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = None
        self.test_results = {}
        self.performance_metrics = {}

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def run_full_test_suite(self) -> Dict[str, Any]:
        """Esegue la suite completa di test"""
        print("🚀 AVVIO TEST SUITE COMPLETA - SISTEMA AI ULTRA-ENHANCED CLAS2E")
        print("=" * 80)

        # Test di base
        await self.test_basic_connectivity()
        await self.test_core_ai_system()

        # Test ecosistema completo
        await self.test_learning_analytics()
        await self.test_content_recommendations()
        await self.test_ai_tutoring()
        await self.test_community_intelligence()
        await self.test_collaboration_ai()

        # Test ultra-enhanced
        await self.test_continuous_learning()
        await self.test_iot_integration()
        await self.test_ar_vr_experiences()
        await self.test_certification_system()
        await self.test_digital_portfolios()
        await self.test_ai_mentorship()
        await self.test_career_prediction()
        await self.test_peer_marketplace()

        # Test performance e analytics
        await self.test_performance_metrics()
        await self.test_ecosystem_dashboard()

        # Genera report finale
        return self.generate_test_report()

    async def test_basic_connectivity(self):
        """Test connettività base"""
        print("\n🔌 TEST 1: CONNETTIVITÀ BASE")

        try:
            async with self.session.get(f"{self.base_url}/test") as response:
                data = await response.json()
                print(f"✅ Server raggiungibile: {data.get('status', 'unknown')}")
                print(f"   AI Engine: {data.get('ai_ready', False)}")
                print(f"   Monitor attivo: {data.get('monitor_active', False)}")
                self.test_results['connectivity'] = True
        except Exception as e:
            print(f"❌ Errore connettività: {e}")
            self.test_results['connectivity'] = False

    async def test_core_ai_system(self):
        """Test sistema AI core"""
        print("\n🧠 TEST 2: SISTEMA AI CORE")

        try:
            # Test health check
            async with self.session.get(f"{self.base_url}/ai/system/health") as response:
                health = await response.json()
                print(f"✅ Sistema AI attivo: {health.get('is_initialized', False)}")
                print(f"   Modelli trained: {health.get('models_trained', False)}")

            # Test analisi utente
            test_user_id = "test_student_001"
            async with self.session.get(f"{self.base_url}/users/{test_user_id}/analysis/complete") as response:
                if response.status == 200:
                    analysis = await response.json()
                    print(f"✅ Analisi utente completa: {len(analysis)} campi analizzati")
                    self.test_results['core_ai'] = True
                else:
                    print(f"⚠️  Analisi utente non disponibile (status: {response.status})")
                    self.test_results['core_ai'] = False

        except Exception as e:
            print(f"❌ Errore sistema AI core: {e}")
            self.test_results['core_ai'] = False

    async def test_learning_analytics(self):
        """Test analytics apprendimento"""
        print("\n📊 TEST 3: LEARNING ANALYTICS")

        try:
            async with self.session.get(f"{self.base_url}/ai/learning/analytics/global") as response:
                analytics = await response.json()
                print(f"✅ Analytics apprendimento: {analytics.get('total_students', 0)} studenti")
                print(f"   Engagement medio: {analytics.get('learning_metrics', {}).get('average_engagement_score', 0):.2%}")
                self.test_results['learning_analytics'] = True
        except Exception as e:
            print(f"❌ Errore learning analytics: {e}")
            self.test_results['learning_analytics'] = False

    async def test_content_recommendations(self):
        """Test raccomandazioni contenuti"""
        print("\n📚 TEST 4: CONTENT RECOMMENDATIONS")

        try:
            test_user = "test_student_001"
            async with self.session.get(f"{self.base_url}/users/{test_user}/content/recommendations") as response:
                if response.status == 200:
                    recommendations = await response.json()
                    print(f"✅ Raccomandazioni contenuti generate: {len(recommendations.get('recommendations', []))} suggerimenti")
                    self.test_results['content_recommendations'] = True
                else:
                    print(f"⚠️  Raccomandazioni non disponibili (status: {response.status})")
                    self.test_results['content_recommendations'] = False
        except Exception as e:
            print(f"❌ Errore content recommendations: {e}")
            self.test_results['content_recommendations'] = False

    async def test_ai_tutoring(self):
        """Test AI tutoring"""
        print("\n🤖 TEST 5: AI TUTORING")

        try:
            test_user = "test_student_001"
            async with self.session.get(f"{self.base_url}/users/{test_user}/ai/tutoring") as response:
                if response.status == 200:
                    tutoring = await response.json()
                    print(f"✅ AI tutoring disponibile: {len(tutoring.get('ai_tutoring', {}))} suggerimenti")
                    self.test_results['ai_tutoring'] = True
                else:
                    print(f"⚠️  AI tutoring non disponibile (status: {response.status})")
                    self.test_results['ai_tutoring'] = False
        except Exception as e:
            print(f"❌ Errore AI tutoring: {e}")
            self.test_results['ai_tutoring'] = False

    async def test_community_intelligence(self):
        """Test community intelligence"""
        print("\n💬 TEST 6: COMMUNITY INTELLIGENCE")

        try:
            async with self.session.get(f"{self.base_url}/ai/community/health") as response:
                health = await response.json()
                print(f"✅ Community health: Score {health.get('overall_health_score', 0)}/10")
                print(f"   Discussioni attive: {health.get('active_discussions', 0)}")
                self.test_results['community_intelligence'] = True
        except Exception as e:
            print(f"❌ Errore community intelligence: {e}")
            self.test_results['community_intelligence'] = False

    async def test_collaboration_ai(self):
        """Test AI collaborazione"""
        print("\n🚀 TEST 7: COLLABORATION AI")

        try:
            test_user = "test_student_001"
            async with self.session.get(f"{self.base_url}/users/{test_user}/collaboration/matches") as response:
                if response.status == 200:
                    matches = await response.json()
                    print(f"✅ Match collaborazioni: {len(matches.get('collaboration_matches', {}))} opportunità")
                    self.test_results['collaboration_ai'] = True
                else:
                    print(f"⚠️  Collaborazione AI non disponibile (status: {response.status})")
                    self.test_results['collaboration_ai'] = False
        except Exception as e:
            print(f"❌ Errore collaboration AI: {e}")
            self.test_results['collaboration_ai'] = False

    async def test_continuous_learning(self):
        """Test apprendimento continuo"""
        print("\n🔄 TEST 8: CONTINUOUS LEARNING")

        try:
            async with self.session.post(f"{self.base_url}/ai/enhanced/enable-continuous-learning") as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ Continuous learning: {result.get('status', 'unknown')}")
                    self.test_results['continuous_learning'] = True
                else:
                    print(f"⚠️  Continuous learning non disponibile (status: {response.status})")
                    self.test_results['continuous_learning'] = False
        except Exception as e:
            print(f"❌ Errore continuous learning: {e}")
            self.test_results['continuous_learning'] = False

    async def test_iot_integration(self):
        """Test integrazione IoT"""
        print("\n📱 TEST 9: IoT INTEGRATION")

        try:
            test_data = {
                "noise_level": 35,
                "light_sensor": 250,
                "motion_sensor": 0.2
            }

            async with self.session.post(
                f"{self.base_url}/ai/enhanced/integrate-iot-device",
                params={"user_id": "test_student_001"},
                json=test_data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print(f"✅ IoT integrato: {result.get('device_integrated', False)}")
                    print(f"   Contenuto adattato: {result.get('content_adapted', False)}")
                    self.test_results['iot_integration'] = True
                else:
                    print(f"⚠️  IoT integration non disponibile (status: {response.status})")
                    self.test_results['iot_integration'] = False
        except Exception as e:
            print(f"❌ Errore IoT integration: {e}")
            self.test_results['iot_integration'] = False

    async def test_ar_vr_experiences(self):
        """Test esperienze AR/VR"""
        print("\n🕶️ TEST 10: AR/VR EXPERIENCES")

        try:
            async with self.session.post(
                f"{self.base_url}/ai/enhanced/create-ar-experience",
                params={
                    "user_id": "test_student_001",
                    "subject": "matematica",
                    "concept": "geometria_solida"
                }
            ) as response:
                if response.status == 200:
                    experience = await response.json()
                    print(f"✅ AR experience creata: {experience.get('ar_scenario_created', {}).get('subject', 'unknown')}")
                    print(f"   Elementi interattivi: {experience.get('interactive_elements_count', 0)}")
                    self.test_results['ar_vr_experiences'] = True
                else:
                    print(f"⚠️  AR/VR experiences non disponibili (status: {response.status})")
                    self.test_results['ar_vr_experiences'] = False
        except Exception as e:
            print(f"❌ Errore AR/VR experiences: {e}")
            self.test_results['ar_vr_experiences'] = False

    async def test_certification_system(self):
        """Test sistema certificazione"""
        print("\n🏆 TEST 11: CERTIFICATION SYSTEM")

        try:
            async with self.session.post(
                f"{self.base_url}/ai/enhanced/certification/assess",
                params={"user_id": "test_student_001", "skill": "python_programming"}
            ) as response:
                if response.status == 200:
                    assessment = await response.json()
                    print(f"✅ Assessment certificazione: {assessment.get('competency_level', 'unknown')}")
                    print(f"   Eleggibile: {assessment.get('certification_eligible', False)}")
                    self.test_results['certification_system'] = True
                else:
                    print(f"⚠️  Certification system non disponibile (status: {response.status})")
                    self.test_results['certification_system'] = False
        except Exception as e:
            print(f"❌ Errore certification system: {e}")
            self.test_results['certification_system'] = False

    async def test_digital_portfolios(self):
        """Test portfolio digitali"""
        print("\n📋 TEST 12: DIGITAL PORTFOLIOS")

        try:
            async with self.session.get(f"{self.base_url}/ai/enhanced/portfolio/create/test_student_001") as response:
                if response.status == 200:
                    portfolio = await response.json()
                    print(f"✅ Portfolio creato: {len(portfolio.get('sections', {}))} sezioni")
                    print(f"   Integrazioni: {len(portfolio.get('integrations', {}))}")
                    self.test_results['digital_portfolios'] = True
                else:
                    print(f"⚠️  Digital portfolios non disponibili (status: {response.status})")
                    self.test_results['digital_portfolios'] = False
        except Exception as e:
            print(f"❌ Errore digital portfolios: {e}")
            self.test_results['digital_portfolios'] = False

    async def test_ai_mentorship(self):
        """Test AI mentorship"""
        print("\n👨‍🏫 TEST 13: AI MENTORSHIP")

        try:
            mentee_profile = {
                "skill_gaps": ["leadership", "advanced_ml"],
                "goals": ["career_advancement"],
                "experience_level": "intermediate"
            }

            async with self.session.post(
                f"{self.base_url}/ai/enhanced/mentorship/match",
                params={"mentee_id": "test_student_001"},
                json=mentee_profile
            ) as response:
                if response.status == 200:
                    match = await response.json()
                    print(f"✅ Mentorship match: {match.get('mentee_id', 'unknown')} ↔ {match.get('mentor_id', 'unknown')}")
                    print(f"   Compatibility: {match.get('compatibility_score', 0):.2f}")
                    self.test_results['ai_mentorship'] = True
                else:
                    print(f"⚠️  AI mentorship non disponibile (status: {response.status})")
                    self.test_results['ai_mentorship'] = False
        except Exception as e:
            print(f"❌ Errore AI mentorship: {e}")
            self.test_results['ai_mentorship'] = False

    async def test_career_prediction(self):
        """Test previsione carriera"""
        print("\n🎯 TEST 14: CAREER PREDICTION")

        try:
            async with self.session.get(f"{self.base_url}/ai/enhanced/career/predict/test_student_001") as response:
                if response.status == 200:
                    prediction = await response.json()
                    print(f"✅ Career prediction: Livello attuale {prediction.get('current_skill_level', 'unknown')}")
                    print(f"   Ruoli previsti: {len(prediction.get('predicted_roles', []))}")
                    self.test_results['career_prediction'] = True
                else:
                    print(f"⚠️  Career prediction non disponibile (status: {response.status})")
                    self.test_results['career_prediction'] = False
        except Exception as e:
            print(f"❌ Errore career prediction: {e}")
            self.test_results['career_prediction'] = False

    async def test_peer_marketplace(self):
        """Test marketplace peer-to-peer"""
        print("\n🏪 TEST 15: PEER MARKETPLACE")

        try:
            content_data = {
                "title": "Guida Avanzata Python per Data Science",
                "description": "Corso completo su Python per analisi dati",
                "type": "course",
                "tags": ["python", "data_science", "machine_learning"],
                "price": 49.99
            }

            async with self.session.post(
                f"{self.base_url}/ai/enhanced/generate-marketplace-content",
                params={"creator_id": "test_teacher_001"},
                json=content_data
            ) as response:
                if response.status == 200:
                    listing = await response.json()
                    print(f"✅ Marketplace listing: {listing.get('marketplace_listing', {}).get('title', 'unknown')}")
                    print(f"   Quality score: {listing.get('marketplace_listing', {}).get('ai_quality_score', 0):.2f}")
                    self.test_results['peer_marketplace'] = True
                else:
                    print(f"⚠️  Peer marketplace non disponibile (status: {response.status})")
                    self.test_results['peer_marketplace'] = False
        except Exception as e:
            print(f"❌ Errore peer marketplace: {e}")
            self.test_results['peer_marketplace'] = False

    async def test_performance_metrics(self):
        """Test metriche performance"""
        print("\n📈 TEST 16: PERFORMANCE METRICS")

        try:
            async with self.session.get(f"{self.base_url}/ai/performance/analysis") as response:
                metrics = await response.json()
                print(f"✅ Performance analysis: {metrics.get('system_type', 'unknown')}")
                print(f"   Overall improvement: {metrics.get('overall_improvement', 'unknown')}")
                self.test_results['performance_metrics'] = True
        except Exception as e:
            print(f"❌ Errore performance metrics: {e}")
            self.test_results['performance_metrics'] = False

    async def test_ecosystem_dashboard(self):
        """Test dashboard ecosistema"""
        print("\n📊 TEST 17: ECOSYSTEM DASHBOARD")

        try:
            async with self.session.get(f"{self.base_url}/ai/ecosystem/dashboard") as response:
                dashboard = await response.json()
                print(f"✅ Ecosystem dashboard: {dashboard.get('ecosystem_overview', {}).get('total_students', 0)} studenti")
                print(f"   AI interactions giornaliere: {dashboard.get('ecosystem_overview', {}).get('ai_interactions_daily', 0)}")
                self.test_results['ecosystem_dashboard'] = True
        except Exception as e:
            print(f"❌ Errore ecosystem dashboard: {e}")
            self.test_results['ecosystem_dashboard'] = False

    def generate_test_report(self) -> Dict[str, Any]:
        """Genera report finale dei test"""
        print("\n" + "=" * 80)
        print("📋 REPORT FINALE TEST SUITE")
        print("=" * 80)

        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result)

        print(f"🧪 Test totali eseguiti: {total_tests}")
        print(f"✅ Test passati: {passed_tests}")
        print(f"❌ Test falliti: {total_tests - passed_tests}")
        print(f"📊 Success rate: {passed_tests/total_tests:.1f}")
        print("\n📊 RISULTATI DETTAGLIATI:")

        for test_name, result in self.test_results.items():
            status = "✅ PASSATO" if result else "❌ FALLITO"
            print(f"  {status}: {test_name.replace('_', ' ').title()}")

        print("\n🏆 CONCLUSIONI:")
        if passed_tests >= total_tests * 0.8:
            print("🎉 SISTEMA AI ULTRA-ENHANCED OPERATIVO AL 80%+")
            print("🚀 Pronto per deployment in produzione!")
        elif passed_tests >= total_tests * 0.6:
            print("⚠️  SISTEMA OPERATIVO AL 60% - Richiede ottimizzazioni")
        else:
            print("❌ SISTEMA RICHIEDE ATTENZIONE - Molte funzionalità non operative")

        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": passed_tests / total_tests if total_tests > 0 else 0,
            "test_results": self.test_results,
            "recommendations": self.generate_recommendations()
        }

    def generate_recommendations(self) -> List[str]:
        """Genera raccomandazioni basate sui risultati dei test"""
        recommendations = []

        failed_tests = [name for name, result in self.test_results.items() if not result]

        if 'connectivity' in failed_tests:
            recommendations.append("Verifica che il server sia avviato correttamente")

        if any(test in failed_tests for test in ['core_ai', 'learning_analytics']):
            recommendations.append("Controlla configurazione database e modelli AI")

        if any(test in failed_tests for test in ['continuous_learning', 'iot_integration', 'ar_vr_experiences']):
            recommendations.append("Alcune funzionalità ultra-enhanced potrebbero richiedere configurazione aggiuntiva")

        if len(failed_tests) > len(self.test_results) * 0.3:
            recommendations.append("Riesamina configurazione sistema - molti test falliti")

        if not recommendations:
            recommendations.append("Sistema operativo correttamente - tutti i test passati!")

        return recommendations


async def run_interactive_test():
    """Test interattivo guidato"""
    print("🎮 TEST INTERATTIVO GUIDATO - SISTEMA AI CLAS2E")
    print("=" * 60)

    async with Clas2eAITester() as tester:
        # Menu interattivo
        while True:
            print("\n🔍 SCEGLI TIPO DI TEST:")
            print("1. 🧪 Test completo automatico")
            print("2. 🔌 Test connettività base")
            print("3. 🧠 Test AI core")
            print("4. ⚡ Test funzionalità ultra-enhanced")
            print("5. 📊 Test dashboard e analytics")
            print("6. 🚪 Esci")

            try:
                choice = input("\nScegli opzione (1-6): ").strip()

                if choice == "1":
                    print("\n🚀 Avvio test completo... (potrebbe richiedere alcuni minuti)")
                    results = await tester.run_full_test_suite()
                    print(f"\nRisultati: {results['passed_tests']}/{results['total_tests']} test passati")

                elif choice == "2":
                    await tester.test_basic_connectivity()

                elif choice == "3":
                    await tester.test_core_ai_system()
                    await tester.test_learning_analytics()

                elif choice == "4":
                    await tester.test_continuous_learning()
                    await tester.test_iot_integration()
                    await tester.test_ar_vr_experiences()

                elif choice == "5":
                    await tester.test_ecosystem_dashboard()
                    await tester.test_performance_metrics()

                elif choice == "6":
                    print("👋 Arrivederci!")
                    break

                else:
                    print("❌ Scelta non valida. Riprova.")

            except KeyboardInterrupt:
                print("\n👋 Test interrotto dall'utente.")
                break
            except Exception as e:
                print(f"❌ Errore durante il test: {e}")


def main():
    """Funzione principale"""
    import argparse

    parser = argparse.ArgumentParser(description="Test Suite Sistema AI Ultra-Enhanced Clas2e")
    parser.add_argument("--url", default="http://localhost:8000", help="URL del server clas2e")
    parser.add_argument("--interactive", action="store_true", help="Modalità interattiva")
    parser.add_argument("--quick", action="store_true", help="Test veloce (solo connettività)")

    args = parser.parse_args()

    if args.quick:
        # Test veloce
        async def quick_test():
            async with Clas2eAITester(args.url) as tester:
                await tester.test_basic_connectivity()
                print("✅ Test veloce completato")

        asyncio.run(quick_test())

    elif args.interactive:
        # Modalità interattiva
        asyncio.run(run_interactive_test())

    else:
        # Test completo
        async def full_test():
            async with Clas2eAITester(args.url) as tester:
                results = await tester.run_full_test_suite()
                print(f"\n📋 RISULTATO FINALE:")
                print(f"Success rate: {results['success_rate']:.1%}")

                print("\n💡 RACCOMANDAZIONI:")
                for rec in results['recommendations']:
                    print(f"  • {rec}")

        asyncio.run(full_test())


if __name__ == "__main__":
    main()
