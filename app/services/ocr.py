import os
import base64
from google.genai import Client
from google.genai import types
from app.models import OcrExtractedData

class OcrService:
    def __init__(self):
        env = os.environ.get('ENVIRONMENT', 'dev')
        if env == 'prod':
            self.client = Client(vertexai=True)
        else:
            self.client = Client()

    async def extract_warrant_data(self, document_base64: str) -> OcrExtractedData:
        # Create a document part from base64
        # Assuming the document is a PDF or image, for standard warrants let's assume PDF
        # We can pass the base64 string directly in the Part if we specify mime_type
        # The prompt asks the model to extract the details.

        system_instruction = "You are a legal document assistant. Extract the detainee name, crime classification, and warrant number from the provided document."

        response = await self.client.aio.models.generate_content(
            model='gemini-1.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=base64.b64decode(document_base64),
                    mime_type='application/pdf'
                ),
                "Extract the required information from this document."
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=OcrExtractedData,
                temperature=0.0
            )
        )
        return response.parsed
