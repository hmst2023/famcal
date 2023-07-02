from pydantic import BaseModel, Field
from bson import ObjectId, Optional
import datetime
from typing import Union


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


class EventUpdate(BaseModel):
    text: Optional[str] = None
    channel: Optional[str] = None
    start: Optional[datetime.datetime] = None


class Event(BaseModel):
    timestamp: datetime.datetime
    channel: str
    author: str
    start: datetime.datetime
    end: datetime.datetime
    text: str


class EventWithId(MongoBaseModel):
    timestamp: datetime.datetime
    channel: str
    author: str
    start: datetime.datetime
    end: datetime.datetime
    text: str


class Date(BaseModel):
    date: datetime.date
    day: str
    nora: str
    livia: str
    martina: str
    hannes: str


class Cards(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    channel: str
    items: list[Union[str, datetime.time]]


class DateWithId(BaseModel):
    date: datetime.date
    cards: list[Cards]


class UserBase(BaseModel):
    username:str
    password:str


class LoginBase(BaseModel):
    username: str
    password: str


class CurrentUser(BaseModel):
    username: str
    password: str

