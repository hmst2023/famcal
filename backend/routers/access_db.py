from pymongo import MongoClient
from decouple import config

DB_URL = config('DB_URL', cast=str)  # deactivate for use with deta
DB_NAME = config('DB_NAME', cast=str)  # deactivate for use with deta


def database():
    client = MongoClient(DB_URL)
    return client[DB_NAME]
