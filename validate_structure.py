#!/usr/bin/env python3
"""
Backend Structure Validator

Überprüft, ob alle erwarteten Module und Funktionen vorhanden sind.
"""

import sys
from pathlib import Path

# Farben für Terminal-Output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def check_file_exists(filepath: str) -> bool:
    """Prüfe ob Datei existiert."""
    return Path(filepath).exists()


def print_check(name: str, passed: bool):
    """Formatierte Check-Ausgabe."""
    symbol = f"{GREEN}✓{RESET}" if passed else f"{RED}✗{RESET}"
    status = f"{GREEN}OK{RESET}" if passed else f"{RED}FEHLT{RESET}"
    print(f"{symbol} {name:.<50} {status}")


def main():
    """Hauptvalidierung."""
    print("\n" + "=" * 60)
    print("🔍 Backend-Struktur Validierung")
    print("=" * 60 + "\n")
    
    backend_root = Path(__file__).parent / "backend"
    
    # Kern-Module
    print("📦 Kern-Module:")
    core_modules = [
        "main.py",
        "models.py",
        "schemas.py",
        "crud.py",
        "db.py",
        "migrate.py",
        "export.py",
        "scheduler.py",
    ]
    
    core_ok = 0
    for module in core_modules:
        exists = check_file_exists(backend_root / module)
        print_check(module, exists)
        if exists:
            core_ok += 1
    
    # Neue Module
    print("\n✨ Neue Module (Refactoring):")
    new_modules = [
        "constants.py",
        "utils.py",
        "logger.py",
        "services/stats_service.py",
    ]
    
    new_ok = 0
    for module in new_modules:
        exists = check_file_exists(backend_root / module)
        print_check(module, exists)
        if exists:
            new_ok += 1
    
    # Dokumentation
    print("\n📚 Dokumentation:")
    docs = [
        "backend/README.md",
        "REFACTORING_SUMMARY.md",
        "REFACTORING_DONE.md",
    ]
    
    docs_ok = 0
    for doc in docs:
        exists = check_file_exists(Path(__file__).parent / doc)
        print_check(doc, exists)
        if exists:
            docs_ok += 1
    
    # Setup-Dateien
    print("\n⚙️  Setup & Config:")
    setup_files = [
        "backend/requirements.txt",
        "backend/requirements-dev.txt",
        "backend/setup.cfg",
        "backend/.pre-commit-config.yaml",
    ]
    
    setup_ok = 0
    for file in setup_files:
        exists = check_file_exists(Path(__file__).parent / file)
        print_check(file, exists)
        if exists:
            setup_ok += 1
    
    # Backup
    print("\n💾 Backup:")
    backup_exists = check_file_exists(backend_root / "main_backup.py")
    print_check("main_backup.py", backup_exists)
    
    # Zusammenfassung
    print("\n" + "=" * 60)
    print("📊 Zusammenfassung:")
    print("=" * 60)
    
    total = len(core_modules) + len(new_modules) + len(docs) + len(setup_files) + 1
    passed = core_ok + new_ok + docs_ok + setup_ok + (1 if backup_exists else 0)
    
    percentage = (passed / total) * 100
    
    print(f"\nGesamt: {passed}/{total} Dateien vorhanden ({percentage:.1f}%)")
    
    if percentage == 100:
        print(f"\n{GREEN}✅ Alle Dateien vorhanden! Refactoring erfolgreich.{RESET}")
        return 0
    elif percentage >= 90:
        print(f"\n{YELLOW}⚠️  Fast vollständig. Fehlende Dateien prüfen.{RESET}")
        return 1
    else:
        print(f"\n{RED}❌ Mehrere Dateien fehlen. Refactoring unvollständig.{RESET}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
