from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId, Optional
import datetime
from typing import Union, List


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError('invalid objectid')
        return str(v)

    @classmethod
    def __modify_schema__(cls,field_schema):
        field_schema.update(type='string')


class MongoBaseModel(BaseModel):
    id:PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        jsonable_encoder = {ObjectId:str}


class ChangePass(BaseModel):
    old: str
    new: str


class EventUpdate(BaseModel):
    text: Optional[str] = None
    channel: Optional[str] = None
    start: Optional[datetime.datetime] = None


class Disposal(BaseModel):
    username: str


class Proposal(BaseModel):
    username: Optional[str]
    email: EmailStr


class ProposalUser(BaseModel):
    username: str
    email: EmailStr


class ProposalFam(BaseModel):
    email: EmailStr


class Event(BaseModel):
    timestamp: datetime.datetime
    channel: str
    author: str
    start: datetime.datetime
    end: datetime.datetime
    text: str


class Cards(BaseModel):
    event_id: PyObjectId
    channel: str
    items: list[Union[str, datetime.time]]


class DateWithId(BaseModel):
    date: datetime.date
    cards: list[Cards]


class UserBase(BaseModel):
    username: str
    email: EmailStr
    password: str
    link: str


class LoginBase(BaseModel):
    email: EmailStr
    password: str


class CurrentUser(MongoBaseModel):
    username: str
    admin: bool


class AddOther(BaseModel):
    name: str
