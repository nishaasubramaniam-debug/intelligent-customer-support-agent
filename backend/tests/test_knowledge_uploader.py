import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.main import app

client = TestClient(app)


def test_upload_text_and_markdown_document():
    file_content = b"# Returns Policy\n\nCustomers can return items within 30 days."
    files = {"file": ("test_returns_policy.md", file_content, "text/markdown")}

    response = client.post("/api/knowledge/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"] == "test_returns_policy.md"
    assert data["file_type"] == "md"

    # Cleanup
    client.delete("/api/knowledge/test_returns_policy.md")


def test_scrape_webpage_url():
    mock_html = """
    <html>
        <head><title>Official Shipping Rules</title></head>
        <body>
            <h1>Shipping Options</h1>
            <p>Standard delivery takes 3 to 5 business days across all regions.</p>
        </body>
    </html>
    """

    mock_response = MagicMock()
    mock_response.text = mock_html
    mock_response.raise_for_status = MagicMock()

    with patch("httpx.Client.get", return_value=mock_response):
        payload = {
            "url": "https://example.com/shipping-policy",
            "custom_title": "Official Shipping Rules"
        }
        response = client.post("/api/knowledge/scrape", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "web_" in data["filename"]
        assert data["title"] == "Official Shipping Rules"

        # Cleanup
        client.delete(f"/api/knowledge/{data['filename']}")
