#!/usr/bin/env python3
"""
Test individual packages to identify what's missing
"""

import sys
import subprocess

def test_package(package_name, import_name=None):
    """Test if a package can be imported"""
    if import_name is None:
        import_name = package_name.replace('-', '_')

    try:
        if '.' in import_name:
            # Handle submodules like sklearn
            module_parts = import_name.split('.')
            module = __import__(module_parts[0])
            for part in module_parts[1:]:
                module = getattr(module, part)
        else:
            __import__(import_name)
        print(f"✅ {package_name}")
        return True
    except ImportError as e:
        print(f"❌ {package_name} - {e}")
        return False

def main():
    print("🔍 Testing Individual Packages")
    print("=" * 40)

    # Core packages
    packages = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('streamlit', 'streamlit'),
        ('pandas', 'pandas'),
        ('numpy', 'numpy'),
        ('scikit-learn', 'sklearn'),
        ('plotly', 'plotly'),
        ('sqlalchemy', 'sqlalchemy'),
        ('psycopg2', 'psycopg2'),
        ('pydantic', 'pydantic'),
    ]

    passed = 0
    total = len(packages)

    for package_name, import_name in packages:
        if test_package(package_name, import_name):
            passed += 1

    print(f"\n📊 Results: {passed}/{total} packages working")

    if passed < total:
        print("\n⚠️ Missing packages detected!")
        print("Run: pip install -r requirements.txt")
    else:
        print("\n🎉 All core packages ready!")

    return passed == total

if __name__ == "__main__":
    success = main()
    input("\nPress Enter to exit...")
    sys.exit(0 if success else 1)
