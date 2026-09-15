import requests
from urllib.parse import quote


def get_company_legal_info(company):

    print("\n========== GLEIF SEARCH ==========")
    print(f"Searching GLEIF for: {company}")

    # --------------------------------------------------
    # STEP 1 - Search LEI records directly
    # --------------------------------------------------

    search_url = "https://api.gleif.org/api/v1/lei-records"

    params = {
        "filter[entity.legalName]": company,
        "page[size]": 10
    }

    response = requests.get(
        search_url,
        params=params,
        timeout=15
    )

    print("GLEIF Search Status:", response.status_code)

    response.raise_for_status()

    data = response.json()

    print("\n========== GLEIF RAW RESPONSE ==========")
    print(data)

    records = data.get("data", [])

    if not records:
        print("No GLEIF records found.")
        return None

    print(f"GLEIF records found: {len(records)}")

    # --------------------------------------------------
    # STEP 2 - Select best matching record
    # --------------------------------------------------

    company_upper = company.strip().upper()

    selected = None

    for record in records:

        attributes = record.get("attributes", {})
        entity = attributes.get("entity", {})

        legal_name_data = entity.get("legalName", {})

        if isinstance(legal_name_data, dict):
            legal_name = legal_name_data.get("name", "")
        else:
            legal_name = str(legal_name_data)

        print("Candidate:", legal_name)

        if legal_name.strip().upper() == company_upper:
            selected = record
            break

        if legal_name.strip().upper() == f"{company_upper} LIMITED":
            selected = record
            break

        if selected is None and company_upper in legal_name.upper():
            selected = record

    # Fallback
    if selected is None:
        selected = records[0]

    # --------------------------------------------------
    # STEP 3 - Extract selected record
    # --------------------------------------------------

    record_attributes = selected.get("attributes", {})
    entity = record_attributes.get("entity", {})

    lei = selected.get("id")

    # Legal name
    legal_name_data = entity.get("legalName", {})

    if isinstance(legal_name_data, dict):
        legal_name = legal_name_data.get(
            "name",
            "Not Available"
        )
    else:
        legal_name = str(legal_name_data)

    # Status
    status = entity.get(
        "status",
        "Unknown"
    )

    # Jurisdiction
    jurisdiction = entity.get(
        "jurisdiction",
        "Unknown"
    )

    # --------------------------------------------------
    # STEP 4 - Extract legal address safely
    # --------------------------------------------------

    address_data = entity.get(
        "legalAddress",
        {}
    )

    address_lines = address_data.get(
        "addressLines",
        []
    )

    if address_lines:
        legal_address = ", ".join(address_lines)

    else:

        address_parts = []

        for field in [
            "city",
            "region",
            "country",
            "postalCode"
        ]:

            value = address_data.get(field)

            if value:
                address_parts.append(str(value))

        legal_address = ", ".join(address_parts)

        if not legal_address:
            legal_address = "Not Available"

    # --------------------------------------------------
    # STEP 5 - Final result
    # --------------------------------------------------

    result = {
        "legal_name": legal_name,
        "lei": lei,
        "status": status,
        "jurisdiction": jurisdiction,
        "legal_address": legal_address
    }

    print("\n========== GLEIF RESULT ==========")
    print(result)

    return result