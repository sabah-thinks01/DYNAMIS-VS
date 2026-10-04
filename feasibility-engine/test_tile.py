import os
import httpx

if "MAPPLS_REST_KEY" not in os.environ:
    raise RuntimeError("MAPPLS_REST_KEY environment variable is not set. Please set it before running this test script.")

key = os.environ["MAPPLS_REST_KEY"]
url = f"https://apis.mappls.com/advancedmaps/v1/{key}/retina_map/11/1460/912.png"

try:
    r = httpx.get(url)
    print("Status:", r.status_code)
    print("Headers:", r.headers)
    print("Response text:", r.text[:200])
except Exception as e:
    print("Error:", e)
