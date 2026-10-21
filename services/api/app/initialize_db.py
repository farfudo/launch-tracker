from app.db import Base, engine
from app.models import Launch  # noqa: F401


def main() -> None:
    """Create the initial schema for local development."""
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    main()
