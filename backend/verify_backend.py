import sys

def verify():
    print("Starting backend verification checklist...")
    print(f"Python Version: {sys.version}")

    try:
        import flask
        print("✔ flask successfully imported")
    except ImportError:
        print("✘ flask import failed")
        sys.exit(1)

    try:
        import flask_cors
        print("✔ flask_cors successfully imported")
    except ImportError:
        print("✘ flask_cors import failed")
        sys.exit(1)

    try:
        import pypdf
        print("✔ pypdf successfully imported")
    except ImportError:
        print("✘ pypdf import failed")
        sys.exit(1)

    try:
        import requests
        print("✔ requests successfully imported")
    except ImportError:
        print("✘ requests import failed")
        sys.exit(1)

    try:
        import dotenv
        print("✔ python-dotenv successfully imported")
    except ImportError:
        print("✘ python-dotenv import failed")
        sys.exit(1)

    print("✔ All required dependencies are present!")
    sys.exit(0)

if __name__ == "__main__":
    verify()
