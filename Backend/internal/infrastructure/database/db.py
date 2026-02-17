from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from internal.domain import Base,inventory_item_maintenance,report_inventory_item,inventory_item,inventory_movement,section,report,maintenance,notification_subscription,user
from internal.utils.setup_env import DBURL, SetupEnv

SetupEnv()
# engine = create_engine('sqlite:///DISERCO-DB')
engine = create_engine(DBURL,connect_args={"options": "-c timezone=America/Santiago"})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def StartDB():
    Base.metadata.create_all(engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()