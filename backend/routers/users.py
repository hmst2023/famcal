from fastapi import Body, status, HTTPException, Depends, APIRouter, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId
from .authentification import Authorization
from .models import LoginBase, CurrentUser, UserBase


router = APIRouter()
auth_handler = Authorization()

MSG_COLLECTION = "Users"


@router.post('/login', response_description='login user')
def login(request: Request, login_user: LoginBase = Body(...)):
    msg_collection = request.app.db[MSG_COLLECTION]
    user = msg_collection.find_one({'username': login_user.username})
    if (user is None) or (not auth_handler.verify_password(login_user.password, user['password'])):
        raise HTTPException(status_code=401, detail='wrong password')
    token = auth_handler.encode_token(str(user["_id"]))
    response = JSONResponse(content={"token":token})
    return response


@router.get('/me', response_description='Logged in user data')
def me(request: Request, user_id=Depends(auth_handler.auth_wrapper)):
    msg_collection = request.app.db[MSG_COLLECTION]
    current_user = msg_collection.find_one({'_id': ObjectId(user_id)})
    print(current_user)
    result = CurrentUser(**current_user).dict()
    result["id"] = user_id
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)


# @router.post('/register', response_description='Register user')
# def register(request: Request, new_user:UserBase = Body(...)):
#     new_user.password = auth_handler.get_password_hash(new_user.password)
#     msg_collection = request.app.db[MSG_COLLECTION]
#     new_user = jsonable_encoder(new_user)
#     user = msg_collection.insert_one(new_user)
#     created_user = msg_collection.find_one({"_id": user.inserted_id})
#     return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_user))
