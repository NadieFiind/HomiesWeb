import os
from data import data
from flask import Flask
from typing import Any, Dict
from pyfacebook import GraphAPI  # type: ignore[import]
from flask_restful import Api, Resource  # type: ignore[import]


class UserLogin(Resource):  # type: ignore[misc]
	def get(self) -> Dict[str, str]:
		api = GraphAPI(
			app_id="601424218351201",
			app_secret=os.getenv("FB_SECRET"),
			oauth_flow=True
		)
		return {"authorization_url": api.get_authorization_url()[0]}


class GetPerson(Resource):  # type: ignore[misc]
	def get(self, person_id: str) -> Any:
		return data["people"].get(person_id)


def create_api(app: Flask) -> None:
	api = Api(app)
	api.add_resource(UserLogin, "/user/login")
	api.add_resource(GetPerson, "/api/<string:person_id>")
