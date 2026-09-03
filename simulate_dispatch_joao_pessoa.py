import httpx
import base64
import os
import asyncio
from httpx import AsyncClient

# Configuration
# Read the Cloud Run URL from the environment or default to localhost
BASE_URL = os.environ.get("API_URL", "http://localhost:8080")

# João Pessoa Coordinates
LATITUDE = -7.11532
LONGITUDE = -34.86105

# Example dummy PDF base64 string (smallest possible valid PDF for test)
dummy_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Count 1\n/Kids [ 3 0 R ]\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [ 0 0 612 792 ]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n198\n%%EOF\n"
encoded_pdf = base64.b64encode(dummy_pdf_content).decode("utf-8")

async def simulate_dispatch():
    print(f"Starting simulated dispatch targeting {BASE_URL}")
    print(f"Location: João Pessoa (Lat: {LATITUDE}, Lon: {LONGITUDE})")

    payload = {
        "client_id": "test_client_123",
        "detainee_name": "João da Silva",
        "detainee_cpf": "12345678900",
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "document_base64": encoded_pdf,
        "warrant_number": "987654321"
    }

    async with AsyncClient(timeout=30.0) as client:
        try:
            # 1. Create Incident
            print("\n1. Creating a new incident...")
            response = await client.post(f"{BASE_URL}/incidents", json=payload)
            response.raise_for_status()
            incident_data = response.json()
            incident_id = incident_data.get("incident_id")
            print(f"Success! Incident created with ID: {incident_id}")
            print(f"Incident response details:\n{incident_data}")

            # 2. Get Nearby Incidents (Simulating what a lawyer app would do)
            print("\n2. Fetching nearby incidents in João Pessoa...")
            nearby_response = await client.get(
                f"{BASE_URL}/incidents/nearby",
                params={"lat": LATITUDE, "lon": LONGITUDE, "radius": 5000}
            )
            nearby_response.raise_for_status()
            nearby_incidents = nearby_response.json()
            print(f"Found {len(nearby_incidents)} nearby incidents.")
            for inc in nearby_incidents:
                print(f" - Incident {inc.get('incident_id')} at {inc.get('geohash')}")

            # 3. Accept Incident (Simulating lawyer accepting)
            print("\n3. Simulating a lawyer accepting the incident...")
            accept_payload = {"lawyer_id": "test_lawyer_abc"}
            accept_response = await client.post(
                f"{BASE_URL}/incidents/{incident_id}/accept",
                json=accept_payload
            )
            accept_response.raise_for_status()
            print(f"Success! Lawyer 'test_lawyer_abc' accepted incident {incident_id}.")

            print("\nSimulation completed successfully!")

        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(simulate_dispatch())
