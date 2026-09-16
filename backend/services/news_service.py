import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")


def get_company_news(company):
    news_url = (
        f"https://newsapi.org/v2/everything?"
        f"qInTitle={company}"
        f"&language=en"
        f"&sortBy=publishedAt"
        f"&pageSize=5"
        f"&apiKey={NEWS_API_KEY}"
    )

    response = requests.get(news_url)
    news_data = response.json()

    headlines = []
    seen = set()

    if news_data.get("status") == "ok":
        for article in news_data.get("articles", []):

            title = article.get("title", "").strip()

            if company.lower() not in title.lower():
                continue

            # Ignore duplicate headlines
            if title.lower() in seen:
                continue

            seen.add(title.lower())
            headlines.append(title)

            if len(headlines) == 3:
                break

    return headlines