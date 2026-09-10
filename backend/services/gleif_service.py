import requests


def get_company_legal_info(company):
    # Step 1: Search for company
    search_url = (
        "https://api.gleif.org/api/v1/fuzzycompletions"
        f"?field=entity.legalName&q={company}"
    )

    search_response = requests.get(search_url)
    search_data = search_response.json()

    if not search_data.get("data"):
        return None

    # Find the best match
    lei = None

    for item in search_data["data"]:
        legal_name = item["attributes"]["value"]

        if legal_name.upper() == f"{company.upper()} LIMITED":
            lei = item["relationships"]["lei-records"]["data"]["id"]
            break

    # Fallback
    if lei is None:
        lei = search_data["data"][0]["relationships"]["lei-records"]["data"]["id"]

    # Step 2: Fetch full LEI record
    details_url = f"https://api.gleif.org/api/v1/lei-records/{lei}"

    details_response = requests.get(details_url)
    details = details_response.json()

    attributes = details["data"]["attributes"]["entity"]

    return {
        "legal_name": attributes["legalName"]["name"],
        "lei": lei,
        "status": details["data"]["attributes"]["entity"]["status"],
        "jurisdiction": attributes["jurisdiction"],
        "legal_address": attributes["legalAddress"]["addressLines"][0],
    }