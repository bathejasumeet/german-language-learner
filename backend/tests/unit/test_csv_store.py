"""Unit tests for CsvStore (backend/src/csv_store.py)."""
import pytest
from pathlib import Path
from src.csv_store import CsvStore


COLUMNS = ["id", "name", "score"]


@pytest.fixture
def store(tmp_path):
    return CsvStore(tmp_path / "items.csv", COLUMNS, int_fields=("id",), float_fields=("score",))


def test_insert_assigns_sequential_ids(store):
    r1 = store.insert({"name": "Alice", "score": 9.5})
    r2 = store.insert({"name": "Bob", "score": 7.0})
    assert r1["id"] == 1
    assert r2["id"] == 2


def test_get_existing_record(store):
    store.insert({"name": "Alice", "score": 9.5})
    r = store.get(1)
    assert r is not None
    assert r["name"] == "Alice"


def test_get_missing_returns_none(store):
    assert store.get(99) is None


def test_all_returns_all_rows(store):
    store.insert({"name": "Alice", "score": 9.5})
    store.insert({"name": "Bob", "score": 7.0})
    assert len(store.all()) == 2


def test_update_modifies_record(store):
    store.insert({"name": "Alice", "score": 9.5})
    updated = store.update(1, name="Alicia")
    assert updated["name"] == "Alicia"
    assert store.get(1)["name"] == "Alicia"


def test_delete_removes_record(store):
    store.insert({"name": "Alice", "score": 9.5})
    assert store.delete(1) is True
    assert store.get(1) is None


def test_where_filters_by_field(store):
    store.insert({"name": "Alice", "score": 9.5})
    store.insert({"name": "Bob", "score": 7.0})
    results = store.where(name="Alice")
    assert len(results) == 1
    assert results[0]["name"] == "Alice"


def test_type_coercion_on_read(store):
    store.insert({"name": "Alice", "score": 9.5})
    r = store.get(1)
    assert isinstance(r["id"], int)
    assert isinstance(r["score"], float)


def test_persistence_across_instances(tmp_path):
    path = tmp_path / "items.csv"
    s1 = CsvStore(path, COLUMNS, int_fields=("id",), float_fields=("score",))
    s1.insert({"name": "Alice", "score": 9.5})

    s2 = CsvStore(path, COLUMNS, int_fields=("id",), float_fields=("score",))
    assert len(s2.all()) == 1
    assert s2.get(1)["name"] == "Alice"


def test_count(store):
    assert store.count() == 0
    store.insert({"name": "Alice", "score": 9.5})
    assert store.count() == 1
