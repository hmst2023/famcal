import os  # add for use with deta
from fastapi import FastAPI
import uvicorn
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from routers.events import router as event_router
from routers.users import router as user_router
from decouple import config  # deactivate for use with deta
from setup import DEVELOPER_MODE

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

if DEVELOPER_MODE:
    DB_URL = config('DB_URL', cast=str)  # deactivate for use with deta
    DB_NAME = config('DB_NAME', cast=str)  # deactivate for use with deta
else:
    DB_URL = os.getenv("DB_URL", "test")  # add for use with deta
    DB_NAME = os.getenv("DB_NAME", "test")  # add for use with deta


@app.on_event("startup")
def startup():
    app.client = MongoClient(DB_URL)
    app.db = app.client[DB_NAME]


@app.on_event("shutdown")
async def shutdown():
    app.client.close()


app.include_router(event_router, prefix="/events", tags=["events"])
app.include_router(user_router, prefix="/users", tags=["users"])

if DEVELOPER_MODE:
    # deactivate for use with deta
    if __name__ == "__main__":
        uvicorn.run(
            "main:app",
            host="0.0.0.0", port=8000,
            reload=True
        )
