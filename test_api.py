import os
import django
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, r"C:\Users\hp\Desktop\Farm-BAck")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'raithu_backend.settings')
django.setup()

from rest_framework.test import APIClient
import json

def test_endpoints():
    client = APIClient()
    
    endpoints = [
        ("GET", "/api/market-prices/", None),
        ("GET", "/api/market-prices/summary/", None),
        ("GET", "/api/govt-schemes/", None),
        ("GET", "/api/weather/current/", None),
        ("GET", "/api/weather/forecast/", None),
        ("GET", "/api/community/posts/", None),
        ("GET", "/api/disease-detection/knowledge/", None),
        ("POST", "/api/auth/send-otp/", {"phone": "9876543210"}),
        ("POST", "/api/auth/verify-otp/", {"phone": "9876543210", "otp": "1234"}),
        ("POST", "/api/disease-detection/analyze/", {"crop_hint": "tomato"}),
    ]

    print("=" * 60)
    print("RUNNING RAITHUSETU BACKEND API VERIFICATION TESTS")
    print("=" * 60)
    
    all_passed = True
    for method, path, payload in endpoints:
        if method == "GET":
            response = client.get(path)
        else:
            response = client.post(path, data=payload, format='json')
        
        status_ok = response.status_code in [200, 201]
        status_str = f"[{response.status_code}]"
        res_preview = str(response.data)[:60] + "..." if response.data else "{}"
        
        print(f"{method:<5} {path:<32} {status_str:<6} {'PASS' if status_ok else 'FAIL'}")
        if not status_ok:
            all_passed = False
            print("  Error:", response.data)
            
    print("=" * 60)
    if all_passed:
        print("ALL 10 CORE API ENDPOINTS WORKING PROPERLY!")
    else:
        print("SOME ENDPOINTS FAILED")
    print("=" * 60)

if __name__ == '__main__':
    test_endpoints()
