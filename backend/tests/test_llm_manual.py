import sys
from pathlib import Path

# Add the backend directory to Python's import path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from app.services.llm import get_llm


def main():
    print("\n" + "=" * 60)
    print("GEMINI LLM TEST")
    print("=" * 60)

    try:
        llm = get_llm()

        response = llm.invoke(
            "Explain what customer support is in one sentence."
        )

        print("\nGemini Response:")
        print(response.content)

        print("\n" + "=" * 60)
        print("Gemini LLM test completed successfully.")
        print("=" * 60)

    except Exception as e:
        print("\n" + "=" * 60)
        print("Gemini LLM test failed.")
        print(f"Error: {e}")
        print("=" * 60)


if __name__ == "__main__":
    main()