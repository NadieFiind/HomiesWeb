from data import Database
from typing import Any, Dict
from data.models import Person
from flask import Flask, Response, request, jsonify

loop = Database.client.get_io_loop()


def get_person(person_id: str) -> Response:
	person = loop.run_until_complete(Database.get_person(person_id))
	
	if person is None:
		return Response(status=404)
	
	return jsonify(person.toJSON())


def set_person() -> Response:
	jwt: Dict[str, Any] = request.get_json()  # type: ignore[assignment]
	loop.run_until_complete(Database.set_person(jwt["sub"], Person(jwt["name"])))
	return Response(status=204)


def create_api(app: Flask) -> None:
	app.add_url_rule(
		"/api/<string:person_id>", "get_person", view_func=get_person
	)
	app.add_url_rule(
		"/api/setPerson", "set_person",
		methods=["PUT"], view_func=set_person
	)
