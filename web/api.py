from data import data
from flask import Flask
from typing import Any, Dict
from flask_restful import Api, Resource  # type: ignore[import]


class GetPerson(Resource):  # type: ignore[misc]
	def get(self, person_id: str) -> Dict[str, Any]:
		return data["people"].get(person_id)


def create_api(app: Flask) -> None:
	api = Api(app)
	api.add_resource(GetPerson, "/api/<string:person_id>")
