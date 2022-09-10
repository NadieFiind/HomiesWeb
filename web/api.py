from data import data
from typing import Any
from flask import Flask
from flask_restful import Api, Resource  # type: ignore[import]


class Person(Resource):  # type: ignore[misc]
	def get(self, person_id: str) -> Any:
		return data["people"].get(person_id)


def create_api(app: Flask) -> None:
	api = Api(app)
	api.add_resource(Person, "/api/<string:person_id>")
