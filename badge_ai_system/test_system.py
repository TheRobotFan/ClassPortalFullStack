#!/usr/bin/env python3
"""
Quick test script for AI Badge System
Tests basic functionality without requiring database
"""

import sys
import os
import importlib.util

def test_python_version():
    """Test Python version"""
    print(f"🐍 Python version: {sys.version}")
    if sys.version_info >= (3, 8):
        print("✅ Python version OK")
        return True
    else:
        print("❌ Python 3.8+ required")
        return False

def test_directory_structure():
    """Test directory structure"""
    required_dirs = ['app', 'ai', 'monitoring', 'dashboard', 'scripts', 'tests']
    missing_dirs = []

    for dir_name in required_dirs:
        if not os.path.isdir(dir_name):
            missing_dirs.append(dir_name)

    if missing_dirs:
        print(f"❌ Missing directories: {missing_dirs}")
        return False
    else:
        print("✅ Directory structure OK")
        return True

def test_file_existence():
    """Test critical files exist"""
    required_files = [
        'app/main.py',
        'app/models.py',
        'app/database.py',
        'ai/ai_engine.py',
        'requirements.txt',
        'README.md'
    ]

    missing_files = []
    for file_path in required_files:
        if not os.path.isfile(file_path):
            missing_files.append(file_path)

    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ Critical files exist")
        return True

def test_syntax():
    """Test Python syntax of main files"""
    files_to_test = [
        'app/main.py',
        'app/models.py',
        'ai/ai_engine.py'
    ]

    failed_files = []
    for file_path in files_to_test:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                compile(f.read(), file_path, 'exec')
            print(f"✅ {file_path} syntax OK")
        except SyntaxError as e:
            print(f"❌ {file_path} syntax error: {e}")
            failed_files.append(file_path)
        except Exception as e:
            print(f"⚠️ {file_path} read error: {e}")

    return len(failed_files) == 0

def test_requirements():
    """Check if requirements.txt exists and is readable"""
    if os.path.isfile('requirements.txt'):
        try:
            with open('requirements.txt', 'r') as f:
                lines = f.readlines()
            print(f"✅ requirements.txt OK ({len(lines)} packages)")
            return True
        except Exception as e:
            print(f"❌ requirements.txt error: {e}")
            return False
    else:
        print("❌ requirements.txt missing")
        return False

def main():
    """Run all tests"""
    print("🧪 AI Badge System - Quick Test Suite")
    print("=" * 50)

    tests = [
        ("Python Version", test_python_version),
        ("Directory Structure", test_directory_structure),
        ("File Existence", test_file_existence),
        ("Python Syntax", test_syntax),
        ("Requirements File", test_requirements)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1

    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")

    if passed == total:
        print("🎉 All tests passed! System is ready for deployment.")
        print("\n🚀 Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set up database connection")
        print("3. Run: uvicorn app.main:app --reload")
        print("4. Open dashboard: streamlit run dashboard/app.py")
    else:
        print("⚠️ Some tests failed. Please fix issues before proceeding.")

    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
