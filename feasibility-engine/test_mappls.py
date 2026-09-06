import httpx
key = "pembfvwuqdawvznaxggistcdorpdwbwxiato"

url_search = "https://search.mappls.com/search/places/nearby/json"
print("Test 6: search.mappls.com with access_token param and 'bank' keyword")
r5 = httpx.get(url_search, params={"keywords": "bank", "refLocation": "18.1523,74.5768", "access_token": key})
print(r5.status_code, r5.text[:200])

url_adv = "https://apis.mappls.com/advancedmaps/v1/"
print("Test 7: Mappls Tile API")
r7 = httpx.get(f"{url_adv}{key}/retina_map/11/1460/912.png")
print(r7.status_code)
