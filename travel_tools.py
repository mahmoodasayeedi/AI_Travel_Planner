import requests


def get_weather(city):
    """Retrieve a 7-day weather forecast for a city."""
    try:
        geo_response = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={
                "name": city,
                "count": 1,
                "language": "en",
            },
            timeout=10,
        )
        geo_response.raise_for_status()

        locations = geo_response.json().get("results", [])

        if not locations:
            return {"error": f"Location not found: {city}"}

        place = locations[0]

        forecast_response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": place["latitude"],
                "longitude": place["longitude"],
                "daily": (
                    "temperature_2m_max,"
                    "temperature_2m_min,"
                    "precipitation_probability_max"
                ),
                "forecast_days": 7,
                "timezone": "auto",
            },
            timeout=10,
        )
        forecast_response.raise_for_status()

        return {
            "location": place["name"],
            "forecast": forecast_response.json().get("daily", {}),
            "source": "Open-Meteo",
        }

    except (requests.RequestException, ValueError, KeyError) as exc:
        return {"error": f"Weather lookup failed: {exc}"}


def convert_currency(amount, from_currency, to_currency):
    """Convert currency using the latest available reference rate."""
    try:
        from_currency = from_currency.upper()
        to_currency = to_currency.upper()

        response = requests.get(
            "https://api.frankfurter.dev/v1/latest",
            params={
                "base": from_currency,
                "symbols": to_currency,
            },
            timeout=10,
        )
        response.raise_for_status()

        data = response.json()
        rate = data["rates"][to_currency]

        return {
            "amount": amount,
            "from": from_currency,
            "to": to_currency,
            "rate": rate,
            "converted_amount": round(amount * rate, 2),
            "rate_date": data["date"],
            "source": "Frankfurter",
        }

    except (requests.RequestException, ValueError, KeyError) as exc:
        return {"error": f"Currency conversion failed: {exc}"}