from fastapi import FastAPI
import uvicorn
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from routers.events import router as event_router
from routers.users import router as user_router
from decouple import config


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])

DB_URL = config('DB_URL', cast=str)
DB_NAME = config('DB_NAME', cast=str)


@app.on_event("startup")
def startup():
    app.client = MongoClient(DB_URL)
    DB = DB_NAME
    app.db = app.client[DB]


@app.on_event("shutdown")
async def shutdown():
    app.client.close()


app.include_router(event_router, prefix="/events", tags=["events"])
app.include_router(user_router, prefix="/users", tags=["users"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0", port=8000,
        reload=True
    )