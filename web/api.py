from flask import Flask, request
from data import Database, Person
from typing import Any, Dict, Optional
from flask_restful import Api, Resource  # type: ignore[import]


class GetPerson(Resource):  # type: ignore[misc]
	def get(self, person_id: str) -> Optional[Dict[str, Any]]:
		person = Database.get_person(person_id)
		
		if person is None:
			return None
		
		return person.toJSON()


class SetPerson(Resource):  # type: ignore[misc]
	def put(self) -> None:
		jwt: Dict[str, Any] = request.get_json()  # type: ignore[assignment]
		Database.set_person(jwt["sub"], Person(jwt["name"], []))


def create_api(app: Flask) -> None:
	api = Api(app)
	api.add_resource(GetPerson, "/api/<string:person_id>")
	api.add_resource(SetPerson, "/api/setPerson")
