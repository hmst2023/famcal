from fastapi import Body, status, HTTPException, Depends, APIRouter, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import List
import datetime
from bson import ObjectId
from routers.authentification import Authorization
from routers.models import DateWithId, Event, EventUpdate
from pytz import timezone

router = APIRouter()
auth_handler = Authorization()
USER_COLLECTION = "users"


@router.get("/", response_description="List all events")
def list_all_events(request:Request, user_id=Depends(auth_handler.auth_wrapper)) -> List[DateWithId]:
    user_timezone = timezone(request.headers['timezone'])

    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    msg_collection = request.app.db[str(current_user['fam'])]

    utc = datetime.datetime.now(datetime.timezone.utc)
    local_time = utc.astimezone(user_timezone)
    local_date = local_time.replace(microsecond=0,second=0,minute=0,hour=0)

    # local date muss auf die erste minute des tages gesetzt werden
    msg_list = list(msg_collection.find({'start':{'$gt':local_date}}).sort("start"))
    response_msg_list = []
    actual_cards = []
    for position, msg in enumerate(msg_list):
        msg['start'] = msg['start'].replace(tzinfo=datetime.timezone.utc)
        msg['start'] = msg['start'].astimezone(user_timezone)
        temp_date = msg['start'].date()
        temp_card = {
                "cards":[{"event_id":msg["_id"], "channel": msg["channel"], "items":[msg["text"], msg["start"].time()]}]
                }
        if (position+1 < len(msg_list)) and msg_list[position+1]["start"].date() == temp_date:
            actual_cards += temp_card["cards"]
        else:
            if actual_cards:
                temp_card["cards"] = actual_cards + temp_card["cards"]
                response_msg_list.append(DateWithId(date=temp_date, **temp_card))
                actual_cards = []
            else:
                response_msg_list.append(DateWithId(date=temp_date, **temp_card))
    return response_msg_list


@router.get("/event/{event_id}", response_description="List single event")
def show_events(request: Request, event_id: str, user_id=Depends(auth_handler.auth_wrapper)) -> Event:
    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})

    msg_collection = request.app.db[str(current_user['fam'])]
    event = msg_collection.find_one({"_id": ObjectId(event_id)})

    if event is not None:
        return Event(**event)
    raise HTTPException(status_code=404, detail=f"Event with Id: {event_id} not found")


@router.delete("/event/{event_id}", response_description="Delete Event")
def delete_event(request: Request, event_id: str, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    msg_collection = request.app.db[str(current_user['fam'])]

    delete_result = msg_collection.delete_one({"_id":ObjectId(event_id)})
    if delete_result.deleted_count == 1:
        return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content=None)
    raise HTTPException(status_code=404, detail=f"Event with {event_id} not found")


@router.post("/", response_description="Add new entry")
def create_event(request: Request, msg:Event = Body(...), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    msg_collection = request.app.db[str(current_user['fam'])]

    msg = jsonable_encoder(msg)
    msg["timestamp"] = datetime.datetime.utcnow()
    msg["author"] = current_user['username']
    msg["start"] = datetime.datetime.fromisoformat(msg["start"])
    msg["end"] = msg["start"]+datetime.timedelta(hours=2)
    new_msg = msg_collection.insert_one(msg)
    created_msg = msg_collection.find_one({"_id": new_msg.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.patch("/event/{event_id}", response_description="Update event")
def update_event(event_id: str, request:Request, event: EventUpdate = Body(...),
                 user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    msg_collection = request.app.db[str(current_user['fam'])]

    msg = jsonable_encoder(event.dict(exclude_unset=True))
    msg["timestamp"] = datetime.datetime.utcnow()
    msg["author"] = current_user['username']
    if "start" in msg:
        msg["start"] = datetime.datetime.fromisoformat(msg["start"])
        msg["end"] = msg["start"]+datetime.timedelta(hours=2)
    msg_collection.update_one({"_id":ObjectId(event_id)}, {"$set": msg})
    event = msg_collection.find_one({"_id":ObjectId(event_id)})
    if event is not None:
        return JSONResponse(status_code=status.HTTP_200_OK, content="updated")
    raise HTTPException(status_code=404, detail=f"Event with {event_id} not found")
