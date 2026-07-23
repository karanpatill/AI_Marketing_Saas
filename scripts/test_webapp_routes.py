import sys
import time
from playwright.sync_api import sync_playwright

routes = [
    "/",
    "/about-us",
    "/how-it-works",
    "/privacy-policy",
    "/auth",
    "/dashboard"
]

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        results = []
        base_url = "http://localhost:3005"
        
        for route in routes:
            url = f"{base_url}{route}"
            try:
                response = page.goto(url, wait_until="domcontentloaded", timeout=15000)
                status = response.status if response else 0
                title = page.title()
                results.append(f"[PASS] Route '{route}': Status {status} | Title: '{title}'")
            except Exception as e:
                results.append(f"[FAIL] Route '{route}': Error -> {e}")
                
        browser.close()
        
        print("\n--- WEBAPP ROUTE TEST RESULTS ---")
        for res in results:
            print(res)

if __name__ == "__main__":
    run_tests()
