from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from internal.domain import Base,section_inventory_item,inventory_item_maintenance,report_inventory_item,invetory_item,inventory_movement,section,report,maintenance,notification_subscription,user

engine = create_engine('sqlite:///DISERCO-DB')
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def StartDB():
    Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()