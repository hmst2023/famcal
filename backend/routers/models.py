from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from bson import Optional
import datetime
from typing import Union, Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]


class MongoBaseModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)


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
    username: Optional[str] = None
    email: EmailStr


class ProposalUser(BaseModel):
    username: str
    email: EmailStr


class ProposalFam(BaseModel):
    email: EmailStr


class Event(BaseModel):
    author:Optional[str] = None
    channel: str
    start: datetime.datetime
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
    acceptedTerms:bool


class LoginBase(BaseModel):
    email: str
    password: str


class CurrentUser(MongoBaseModel):
    username: str
    admin: bool


class AddOther(BaseModel):
    name: str
