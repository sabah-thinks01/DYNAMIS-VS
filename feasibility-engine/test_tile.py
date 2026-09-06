import httpx

key = "pembfvwuqdawvznaxggistcdorpdwbwxiato"
url = f"https://apis.mappls.com/advancedmaps/v1/{key}/retina_map/11/1460/912.png"

try:
    r = httpx.get(url)
    print("Status:", r.status_code)
    print("Headers:", r.headers)
    print("Response text:", r.text[:200])
except Exception as e:
    print("Error:", e)
