import httpx
import base64
import os
import sys
import asyncio
import argparse
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

async def simulate_dispatch(accept: bool, count: int):
    print(f"Starting simulated dispatch targeting {BASE_URL}")
    print(f"Location: João Pessoa (Lat: {LATITUDE}, Lon: {LONGITUDE})")
    print(f"Number of incidents to create: {count}")

    async with AsyncClient(timeout=30.0) as client:
        try:
            for i in range(count):
                payload = {
                    "client_id": f"test_client_123_{i}",
                    "detainee_name": f"João da Silva {i}",
                    "detainee_cpf": "12345678900",
                    "latitude": LATITUDE + (i * 0.001), # Add small variation
                    "longitude": LONGITUDE + (i * 0.001),
                    "document_base64": encoded_pdf,
                    "warrant_number": f"987654321_{i}"
                }

                # 1. Create Incident
                print(f"\n1. Creating incident {i+1}/{count}...")
                response = await client.post(f"{BASE_URL}/incidents", json=payload)
                response.raise_for_status()
                incident_data = response.json()
                incident_id = incident_data.get("incident_id")
                print(f"Success! Incident created with ID: {incident_id}")

                if accept:
                    # 3. Accept Incident (Simulating lawyer accepting)
                    print(f"\n3. Simulating a lawyer accepting the incident {incident_id}...")
                    accept_payload = {"lawyer_id": "test_lawyer_abc"}
                    accept_response = await client.post(
                        f"{BASE_URL}/incidents/{incident_id}/accept",
                        json=accept_payload
                    )
                    accept_response.raise_for_status()
                    print(f"Success! Lawyer 'test_lawyer_abc' accepted incident {incident_id}.")
                else:
                    print(f"Incident {incident_id} left in PENDING status.")

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
                print(f" - Incident {inc.get('incident_id')} at {inc.get('geohash')} - Status: {inc.get('status', 'N/A')}")

            print("\nSimulation completed successfully!")

        except httpx.HTTPStatusError as e:
            print(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
            sys.exit(1)
        except Exception as e:
            print(f"An error occurred: {e}")
            sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simulate incident dispatch.")
    parser.add_argument("--accept", action="store_true", help="Simulate a lawyer accepting the incident(s).")
    parser.add_argument("--count", type=int, default=1, help="Number of incidents to create.")
    args = parser.parse_args()

    asyncio.run(simulate_dispatch(accept=args.accept, count=args.count))
