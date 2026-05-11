import os
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

os.environ["ENV"] = "test"

from src.main import app
import src.csv_store as csv_store


@pytest.fixture(autouse=True)
def csv_data_dir(tmp_path):
    os.environ["DATA_DIR"] = str(tmp_path)
    csv_store._init_stores(tmp_path)
    yield tmp_path
    os.environ.pop("DATA_DIR", None)


@pytest.fixture
def client():
    return TestClient(app)
