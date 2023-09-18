import datetime

from fastapi.testclient import TestClient
from pymongo import MongoClient
from main import app, DB_URL, DB_NAME

app.client = MongoClient(DB_URL)
app.db = app.client[DB_NAME]

client = TestClient(app)
client.email = "mail_tester@stucki.cc"
client.password = "test"
client.username = "tester"


def test_false_url():
    response = client.get("/hello")
    assert response.status_code == 404


def test_wrong_login():
    response = client.post("/users/login", json={"email":"Hubert", "password":"1234"})
    assert response.status_code == 401
    assert response.json() == {"detail": 'wrong password'}


def test_wrong_me():
    response = client.get("/users/me", headers={"Content-Type": "application/json",
                                                "Authorization": f"Bearer {123}"})
    assert response.status_code == 401
    assert response.json() == {'detail':'invalid'}


def test_propose_fam():
    response = client.post("/users/proposefam", json={"email":client.email})
    assert response.status_code == 201
    res = response.json()
    client.link = res['link']


def test_register():
    response = client.post("/users/register", json={"username": client.username, "email": client.email, "password": client.password, "link": client.link, "acceptedTerms":True})
    assert response.status_code == 200


def test_working_login():
    response = client.post("/users/login", json={"email":client.email, "password": client.password})
    assert response.status_code == 200
    res = response.json()
    client.token = res['token']
    assert len(res['token']) == 172


def test_me():
    response = client.get("/users/me", headers={"Content-Type": "application/json",
                                                "Authorization": f"Bearer {client.token}"})
    assert response.status_code == 200



def test_post_event():
    response = client.post("/events/",
                           headers={"Content-Type": "application/json", "Authorization": f"Bearer {client.token}"},
                           json={"channel": client.username, "start": datetime.datetime.utcnow().isoformat(),
                                 "text": "test"})
    assert response.status_code == 201


def test_add_user():
    response = client.post("users/add", headers={"Content-Type": "application/json",
                                                "Authorization": f"Bearer {client.token}"}, json={'name':'Helmut'})
    assert response.status_code == 201
    assert response.json() == "added Helmut"


def test_propose_user():
    response = client.post("/users/propose", headers={"Content-Type": "application/json",
                                                "Authorization": f"Bearer {client.token}"},
                           json={'username':'Helmut', "email":"tester@stucki.cc"})
    assert response.status_code == 201
    res = response.json()
    client.link_propose_user = res['link']


def test_register_helmut():
    response = client.post("/users/register", json={"username": "Helmut", "email": "tester@stucki.cc",
                                                    "password": client.password, "link": client.link_propose_user,
                                                    "acceptedTerms":True})
    assert response.status_code == 200


def test_login_helmut():
    response = client.post("/users/login", json={"email":"tester@stucki.cc", "password": client.password})
    assert response.status_code == 200
    res = response.json()
    client.helmut_token = res['token']
    assert len(res['token']) == 172


def test_post_helmut_event():
    response = client.post("/events/",
                           headers={"Content-Type": "application/json", "Authorization": f"Bearer {client.helmut_token}"},
                           json={"channel": "Helmut", "start": datetime.datetime.utcnow().isoformat(),
                                 "text": "Helmut"})
    assert response.status_code == 201


def test_dispose_helmut():
    response = client.delete("users/propose", headers={"Content-Type": "application/json",
                                                   "Authorization": f"Bearer {client.token}", "user": "Helmut"})
    assert response.status_code == 201


def test_remove_user():
    response = client.delete("users/add", headers={"Content-Type": "application/json",
                                                   "Authorization": f"Bearer {client.token}", "other":"Helmut"})
    assert response.status_code == 202
    assert response.json() == "deleted Helmut"


def test_delete_fam():
    response = client.delete("users/proposefam",headers={"Content-Type": "application/json",
                                                "Authorization": f"Bearer {client.token}"})
    assert response.status_code == 200
    assert response.json() == "deleted"
