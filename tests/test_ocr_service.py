import os
import pytest
from unittest.mock import patch, MagicMock
from app.models import OcrExtractedData
from app.services.ocr import OcrService

@pytest.fixture
def mock_env():
    with patch.dict(os.environ, {"ENVIRONMENT": "test"}):
        yield

@pytest.mark.asyncio
@patch('app.services.ocr.Client')
async def test_extract_warrant_data_success(mock_client_class, mock_env):
    mock_client = MagicMock()
    mock_client_class.return_value = mock_client

    mock_response = MagicMock()
    # The SDK parses structural output and populates the parsed attribute
    mock_response.parsed = OcrExtractedData(
        detainee_name="João Silva",
        crime_classification="Theft",
        warrant_number="12345-67"
    )
    # the client has an async generate_content_async or similar, but typically one might use models.generate_content (async in client?)
    # or aios / async client.
    # google.genai has `client.aio.models.generate_content`
    mock_aio = MagicMock()
    mock_models = MagicMock()
    mock_client.aio = mock_aio
    mock_aio.models = mock_models

    # We need to mock the async behavior properly
    async def mock_generate_content(*args, **kwargs):
        return mock_response

    mock_models.generate_content.side_effect = mock_generate_content

    service = OcrService()
    import base64
    valid_base64 = base64.b64encode(b"dummy_data").decode("utf-8")
    result = await service.extract_warrant_data(valid_base64)

    assert result.detainee_name == "João Silva"
    assert result.crime_classification == "Theft"
    assert result.warrant_number == "12345-67"

    # verify generate_content was called
    mock_models.generate_content.assert_called_once()

@pytest.mark.asyncio
@patch('app.services.ocr.Client')
async def test_ocr_service_initialization_prod(mock_client_class):
    with patch.dict(os.environ, {"ENVIRONMENT": "prod"}):
        service = OcrService()
        mock_client_class.assert_called_once_with(vertexai=True)

@pytest.mark.asyncio
@patch('app.services.ocr.Client')
async def test_ocr_service_initialization_dev(mock_client_class):
    with patch.dict(os.environ, {"ENVIRONMENT": "dev"}):
        service = OcrService()
        mock_client_class.assert_called_once_with()
