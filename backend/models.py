"""SQLAlchemy ORM models for the database.

Run this file directly to reset the database.
"""

import database

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker


# Base class for ORM models
Base = declarative_base()

# Model definition (EXAMPLE)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, email={self.email})>"



# Reset the database
if __name__ == "__main__":
    # Confirm reset
    confirm = input("Are you sure you want to reset the database? (y/n): ")
    if confirm.lower() != "y":
        print("Database reset cancelled.")
        exit(0)
    
    # Get the database engine
    engine = database.Engine()

    # Delete everything
    Base.metadata.drop_all(engine)

    # Create the tables in the database
    Base.metadata.create_all(engine)

