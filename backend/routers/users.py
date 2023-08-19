import os  # add for use with deta
import datetime
from fastapi import Body, status, HTTPException, Depends, APIRouter, Request
from fastapi.encoders import jsonable_encoder
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from fastapi.responses import JSONResponse
from bson import ObjectId
from .authentification import Authorization
from .models import LoginBase, CurrentUser, UserBase, Proposal, ProposalUser,ProposalFam, AddOther, Disposal, ChangePass
from secrets import token_urlsafe
# from decouple import config  # deactivate for use with deta

router = APIRouter()
auth_handler = Authorization()
USER_COLLECTION = "users"
FAM_COLLECTION = "fams"
PROPOSAL_COLLECTION = 'proposals'

MAIL_USERNAME = os.getenv("MAIL_USERNAME", "test")  # add for use with deta
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "test")  # add for use with deta
MAIL_FROM = os.getenv("MAIL_FROM", "test")  # add for use with deta
MAIL_SERVER = os.getenv("MAIL_SERVER", "test")  # add for use with deta

# MAIL_USERNAME = config('MAIL_USERNAME', cast=str)  # deactivate for use with deta
# MAIL_PASSWORD = config('MAIL_PASSWORD', cast=str)  # deactivate for use with deta
# MAIL_FROM = config('MAIL_FROM', cast=str)  # deactivate for use with deta
# MAIL_SERVER = config('MAIL_SERVER', cast=str)  # deactivate for use with deta


conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_FROM,
    MAIL_PORT=465,
    MAIL_SERVER=MAIL_SERVER,
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

html = """
<p>Thanks for registering on Famplan. Click on the link below to complete the registration process.</p>
<p><a href="$$replace$$">$$replace$$</a></p>
<p>If your mailaddress was not added on purpose, you can just sit back and relax. Your address will be removed in 24 hours.</p>
<p>
"""


@router.patch("/change_pass")
def change_pwd(request: Request, userinf: ChangePass, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not auth_handler.verify_password(userinf.old, current_user['password']):
        raise HTTPException(status_code=403)

    msg = user_collection.update_one({'_id': ObjectId(user_id)}, {"$set":{"password":auth_handler.get_password_hash(userinf.new)}})
    return JSONResponse(status_code=200, content=f"modified {msg.modified_count} entry")


@router.delete("/propose")
async def depose_user(request: Request, userinfs: Disposal,
                      user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    fam_collection = request.app.db[FAM_COLLECTION]

    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    user_for_disposal = user_collection.find_one({'username': userinfs.username, 'fam':current_user['fam']})

    if user_for_disposal['admin']:
        raise HTTPException(status_code=400, detail='Admin cannot be deleted, drop collection instead')

    if not (current_user['admin'] or current_user['username'] == user_for_disposal['username']):
        raise HTTPException(status_code=403, detail='You must be fam-admin!')
    fam_collection.update_one({"_id": ObjectId(current_user['fam'])},
                              {"$set": {f"others.{user_for_disposal['username']}": user_for_disposal['_id']}})

    fam_collection.update_one({"_id": ObjectId(current_user['fam'])}, {"$unset": {f"users.{user_for_disposal['username']}":""}})

    user_collection.update_one({"_id": user_for_disposal['_id']},{"$unset": {"email":"", "admin":"","password":""}})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=f"deposed user")


@router.post("/propose")
async def propose_user(request: Request, userinfs: ProposalUser,
                       user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:

    user_collection = request.app.db[USER_COLLECTION]
    proposal_collection = request.app.db[PROPOSAL_COLLECTION]

    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    proposed_user = user_collection.find_one({'fam': current_user['fam'], 'username': userinfs.username })

    check_if_proposal_already_exists = proposal_collection.find_one({'userId': proposed_user['_id']})
    if check_if_proposal_already_exists is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="user already proposed")

    if not current_user['admin']:
        raise HTTPException(status_code=403, detail='You must be fam-admin!')

    entry = userinfs.dict()
    entry['email'] = entry['email'].lower()

    if (user_collection.count_documents({'email': entry['email']})
            + proposal_collection.count_documents({'email': entry['email']})) > 0:
        raise HTTPException(status_code=409, detail='Mail address already taken')

    generated_magic_link = (token_urlsafe(64))

    message = MessageSchema(
        subject="Fasti - Familienkalender registration process",
        recipients=[userinfs.dict().get("email")],
        body=html.replace("$$replace$$", "https://www.stucki.cc/calender/proposal/"+generated_magic_link),
        subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)

    entry['link'] = generated_magic_link
    entry['userId'] = proposed_user["_id"]
    entry['fam'] = current_user['fam']
    entry['createdAt'] = datetime.datetime.utcnow()
    new_proposal = proposal_collection.insert_one(entry)
    created_msg = proposal_collection.find_one({"_id": new_proposal.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.post("/proposefam")
async def propose_new_family(request: Request, userinfs: ProposalFam) -> JSONResponse:

    user_collection = request.app.db[USER_COLLECTION]
    proposal_collection = request.app.db[PROPOSAL_COLLECTION]

    entry = userinfs.dict()
    entry['email'] = entry['email'].lower()

    if (user_collection.count_documents({'email': entry['email']})
            + proposal_collection.count_documents({'email': entry['email']})) > 0:
        raise HTTPException(status_code=409, detail='Mail address already taken')

    generated_magic_link = (token_urlsafe(64))

    message = MessageSchema(
        subject="Fasti - Familienkalender registration process",
        recipients=[userinfs.dict().get("email")],
        body=html.replace("$$replace$$", "https://www.stucki.cc/calender/proposal/"+generated_magic_link),
        subtype=MessageType.html)
    fm = FastMail(conf)
    await fm.send_message(message)

    entry['link'] = generated_magic_link
    entry['createdAt'] = datetime.datetime.utcnow()
    new_proposal = proposal_collection.insert_one(entry)
    created_msg = proposal_collection.find_one({"_id": new_proposal.inserted_id})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_msg))


@router.delete("/proposefam")
async def delete_family(request: Request, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    fam_collection = request.app.db[FAM_COLLECTION]

    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    current_fam = fam_collection.find_one({'_id': current_user['fam']})
    msg_collection = request.app.db[str(current_user['fam'])]

    if not current_user['admin']:
        raise HTTPException(status_code=403, detail='You must be fam-admin!')
    if not (len(current_fam['users']) == 1 and len(current_fam['others']) == 0):
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail='Erase users and members first')
    msg_collection.drop()
    fam_collection.delete_one({'_id': current_user['fam']})
    user_collection.delete_one({'_id': ObjectId(user_id)})

    return JSONResponse(status_code=status.HTTP_200_OK, content="deleted")


@router.get("/proposal/{link}", response_description="List single event")
def show_proposal(request: Request, link: str) -> Proposal:
    msg_collection = request.app.db[PROPOSAL_COLLECTION]
    proposal = msg_collection.find_one({"link": link})
    if proposal is not None:
        return Proposal(**proposal)
    raise HTTPException(status_code=404, detail=f"No proposal for {link} !")


@router.post('/login', response_description='login user')
def login(request: Request, login_user: LoginBase = Body(...)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    user = user_collection.find_one({'email': login_user.email.lower()})
    if (user is None) or (not auth_handler.verify_password(login_user.password, user['password'])):
        raise HTTPException(status_code=401, detail='wrong password')
    token = auth_handler.encode_token(str(user["_id"]))
    user_collection.update_one({'_id': user['_id']},{"$set": {'lastLogin': datetime.datetime.utcnow()}})
    return JSONResponse(content={"token":token})


@router.get('/me', response_description='Logged in user data')
def me(request: Request, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    fam_collection = request.app.db[FAM_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    user_infs = CurrentUser(**current_user).dict()
    members = fam_collection.find_one({'_id': ObjectId(current_user['fam'])})
    user_infs['members'] = [i for i in members['others'].keys()] + [i for i in members['users'].keys()]
    return JSONResponse(status_code=status.HTTP_200_OK, content=user_infs)


@router.post('/register', response_description='Register user')
def register(request: Request, new_user:UserBase = Body(...)) -> JSONResponse:
    new_user = new_user.dict(exclude_unset=True)
    link = new_user.pop("link")
    proposal_collection = request.app.db[PROPOSAL_COLLECTION]
    proposal = proposal_collection.find_one({"link": link})
    if proposal is None:
        raise HTTPException(status_code=404, detail=f"No proposal for {link} !")

    if not new_user['acceptedTerms']:
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="User terms must be accepted")

    new_user['acceptedTerms'] = datetime.datetime.utcnow()
    new_user['password'] = auth_handler.get_password_hash(new_user['password'])
    new_user['email'] = proposal['email']

    if 'username' in proposal:
        new_user['username'] = proposal['username']

    user_collection = request.app.db[USER_COLLECTION]
    fam_collection = request.app.db[FAM_COLLECTION]

    if 'fam' not in proposal:
        new_fam = fam_collection.insert_one({'users': {new_user['username']: 'userObjectId'}, 'others': {}})
        new_user['fam'] = ObjectId(new_fam.inserted_id)
        new_user['admin'] = True
        added_user = user_collection.insert_one(new_user)
        new_user['_id'] = added_user.inserted_id
        # add here create collection through first post, add index

    else:
        new_user['fam'] = proposal['fam']
        new_user['_id'] = proposal['userId']
        fam_collection.update_one({"_id": ObjectId(new_user['fam'])},
                                  {"$unset": {f"others.{new_user['username']}": ""}})
        new_user['admin'] = False
        user_collection.update_one({"_id":proposal['userId']}, {"$set": new_user})

    proposal_collection.delete_one({"link": link})

    fam_collection.update_one({"_id": ObjectId(new_user['fam'])}, {"$set": {f"users.{new_user['username']}":new_user["_id"]}})

    created_user = user_collection.find_one({"_id": new_user['_id']})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=str(created_user))


@router.post('/add', response_description='add new passive user')
def add_other(request: Request, new_other: AddOther = Body(...), user_id=Depends(auth_handler.auth_wrapper)) \
        -> JSONResponse:

    user_collection = request.app.db[USER_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not current_user['admin']:
        raise HTTPException(status_code=403, detail='You must be fam-admin!')
    fam_collection = request.app.db[FAM_COLLECTION]
    current_fam = fam_collection.find_one({'_id': ObjectId(current_user['fam'])})
    if new_other.name in [i for i in current_fam['users'].keys()] + [i for i in current_fam['others'].keys()]:
        raise HTTPException(status_code=409, detail='Name already taken')

    if len(current_fam['users'])+len(current_fam['others'])>7:
        raise HTTPException(status_code=409, detail="Group size cannot exceed 8 people")
    user = user_collection.insert_one({'username':new_other.name, 'fam':ObjectId(current_user['fam'])}) # edit
    fam_collection.update_one({"_id": ObjectId(current_user['fam'])},
                              {"$set": {f"others.{new_other.name}": ObjectId(user.inserted_id)}})
    return JSONResponse(status_code=status.HTTP_201_CREATED, content=f'added {new_other.name}')


@router.delete('/add', response_description='remove passive user')
def add_other(request: Request, new_other: AddOther = Body(...), user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    proposal_collection = request.app.db[PROPOSAL_COLLECTION]

    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not current_user['admin']:
        raise HTTPException(status_code=403, detail='You must be fam-admin!')
    fam_collection = request.app.db[FAM_COLLECTION]
    current_fam = fam_collection.find_one({'_id': ObjectId(current_user['fam'])})
    if new_other.name not in current_fam['others']:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Name not found')
    id_for_deletion = current_fam['others'][new_other.name]
    fam_collection.update_one({"_id": ObjectId(current_user['fam'])},
                              {"$unset": {f"others.{new_other.name}": ""}})
    user_collection.delete_one({"_id": id_for_deletion})
    check_for_proposals = proposal_collection.find_one({'userId': id_for_deletion})
    if check_for_proposals is not None:
        proposal_collection.delete_one({'userId': id_for_deletion})
    return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content=f'deleted {new_other.name}')


@router.get('/setup', response_description='admin family setup data')
def me(request: Request, user_id=Depends(auth_handler.auth_wrapper)) -> JSONResponse:
    user_collection = request.app.db[USER_COLLECTION]
    fam_collection = request.app.db[FAM_COLLECTION]
    current_user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not current_user['admin']:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='You must be fam-admin!')
    members = fam_collection.find_one({'_id': ObjectId(current_user['fam'])})
    name_email_list = []
    for i in members['users']:
        user = user_collection.find_one({'_id': members['users'][i]})
        name_email_list.append({'name':i, 'email': user['email'], "admin":user['admin']})

    member_wo_id = {'users': name_email_list, 'others':list(members['others'].keys())}
    return JSONResponse(status_code=status.HTTP_200_OK, content=member_wo_id)
