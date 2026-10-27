from sqlalchemy import inspect, text


def test_precision_migration_preserves_legacy_rows_and_rolls_back(pg_database):
    engine, migrate = pg_database
    migrate("downgrade", "20261023_07")
    with engine.begin() as db:
        db.execute(text("INSERT INTO launches (id,name,status,net,source_updated_at) "
                        "VALUES ('legacy','Legacy','Go',NOW(),NOW())"))
    migrate("upgrade", "head")
    with engine.begin() as db:
        assert db.scalar(text("SELECT net_precision FROM launches WHERE id='legacy'")) is None
        assert db.scalar(text("SELECT COUNT(*) FROM launches")) == 1
    migrate("downgrade", "20261023_07")
    assert "net_precision" not in {c["name"] for c in inspect(engine).get_columns("launches")}
    assert "sync_control" in inspect(engine).get_table_names()
    migrate("upgrade", "head")
