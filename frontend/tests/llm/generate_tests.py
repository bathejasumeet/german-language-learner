"""Frontend LLM-based test generation script (Ollama compatible)"""

import os
import requests
import json


def generate_frontend_tests(component_type: str = "component"):
    """
    Generate React component tests using local Ollama LLM.
    
    Args:
        component_type: Type of component to test (component, hook, service)
    """
    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "mistral")
    
    prompt = f"""Generate Jest tests for a React {component_type}.
The tests should cover Words, Flashcards, and Quiz components.
Return valid TypeScript/JavaScript Jest test code."""
    
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
    tests = generate_frontend_tests("component")
    print(tests)
