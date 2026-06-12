# Quickstart: DuckDuckGo Word Capture Extension

## Goal

Run the existing backend, configure the extension against it, and verify that a highlighted German word can be translated and saved into the vocabulary store.

## Prerequisites

- Python 3.11+
- Node.js 18+
- A DuckDuckGo desktop environment that supports Chromium-compatible extensions
- A translation provider endpoint configured for the backend

## 1. Start the backend

From the repository root:

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

Expected result: the API is available at `http://localhost:8000`.

## 2. Configure translation and extension origins

Set backend environment variables before startup or in your local launch environment:

```bash
export TRANSLATION_API_URL="https://your-translation-provider.example/translate"
export EXTENSION_ALLOWED_ORIGINS="chrome-extension://<extension-id>,moz-extension://<extension-id>"
```

The implementation should interpret `EXTENSION_ALLOWED_ORIGINS` as a comma-separated allowlist that augments the existing local frontend origins.

## 3. Build and load the extension

```bash
cd extension
npm install
npm run build
```

Load the generated extension bundle through the target DuckDuckGo browser's developer extension workflow.

## 4. Verify capture and import

1. Open a German-language webpage in DuckDuckGo.
2. Highlight a single German word.
3. Open the extension popup or context-menu action.
4. Confirm the captured word shown in the extension UI.
5. Trigger translate-and-save.
6. Verify success feedback appears in the extension.
7. Confirm the new word is returned by `GET /api/v1/words/`.

## 5. Test failure handling

1. Try importing the same word twice and confirm the second attempt returns a duplicate message.
2. Stop the backend and confirm the extension reports a connection failure without navigating the page.
3. Disable the translation provider or point it at an invalid URL and confirm the extension shows a translation failure.
