from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from routers.events import router as event_router
from routers.users import router as user_router
from setup import DEVELOPER_MODE

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])


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
