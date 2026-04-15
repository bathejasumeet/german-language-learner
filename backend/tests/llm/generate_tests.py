"""LLM-based test generation script for backend (Ollama compatible)"""

import os
import requests
import json


def generate_tests(test_type: str = "unit"):
    """
    Generate tests using local Ollama LLM.
    
    Args:
        test_type: Type of tests to generate (unit, integration, contract)
    """
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "mistral")
    
    prompt = f"""Generate {test_type} tests for a FastAPI backend with SQLAlchemy models.
The tests should cover Word, Flashcard, Quiz, and Progress models.
Return valid Python pytest code."""
    
    try:
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=60
        )
        result = response.json()
        return result.get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Ollama: {e}")
        return ""


if __name__ == "__main__":
    tests = generate_tests("unit")
    print(tests)
