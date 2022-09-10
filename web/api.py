from flask import Flask
from data import Database
from typing import Any, Dict, Optional
from flask_restful import Api, Resource  # type: ignore[import]


class GetPerson(Resource):  # type: ignore[misc]
	def get(self, person_id: str) -> Optional[Dict[str, Any]]:
		person = Database.get_person(person_id)
		
		if person is None:
			return None
		
		return person.toJSON()


def create_api(app: Flask) -> None:
	api = Api(app)
	api.add_resource(GetPerson, "/api/<string:person_id>")
