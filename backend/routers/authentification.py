import os  # add for use with deta
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from datetime import datetime, timedelta
# from decouple import config # deactivate for use with deta

# SECRET_STRING = config('SECRET_STRING', cast=str) # deactivate for use with deta


class Authorization:
    security = HTTPBearer()
    pwd_context = CryptContext(schemes=['bcrypt'], deprecated="auto")
    secret = os.getenv("SECRET_STRING","test")  # add for use with deta
    # secret = SECRET_STRING # deactivate for use with deta

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def encode_token(self, user_id):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=35),
            'iat': datetime.utcnow(),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            self.secret,
            algorithm='HS256'
        )
        # different usage for deploy on raspi:
        # token = jwt.encode (
        #     payload,
        #     self.secret,
        #     algorithm='HS256'
        # )
        # return token.decode('UTF-8')  # convert to string

    def decode_token(self, token):
        try:
            payload = jwt.decode(token, self.secret, algorithms=['HS256'])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='expired')
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail='invalid')

    def auth_wrapper(self, auth: HTTPAuthorizationCredentials = Security(security)):
        return self.decode_token(auth.credentials)
