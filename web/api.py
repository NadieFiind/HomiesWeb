from data import Database
from typing import Optional
from jwt import decode as decode_jwt
from data.models import Person, Connection
from flask import Flask, Response, request, jsonify


def get_user() -> Response:
	jwt_str: Optional[str] = request.cookies.get("jwt")
	
	if jwt_str is None:
		return Response(status=401)
	
	jwt_decoded = decode_jwt(jwt_str, options={"verify_signature": False})
	person = Database.get_person(jwt_decoded["sub"])
	
	if person is None:
		person = Person(jwt_decoded["name"])
		Database.set_person(jwt_decoded["sub"], person)
	
	return jsonify({
		"id": jwt_decoded["sub"],
		"data": person.toJSON()
	})


def get_person(person_id: str) -> Response:
	person = Database.get_person(person_id)
	
	if person is None:
		return Response(status=404)
	
	return jsonify(person.toJSON())


def set_connection() -> Response:
	jwt_str: Optional[str] = request.cookies.get("jwt")
	
	if jwt_str is None:
		return Response(status=401)
	
	data = request.get_json()
	
	if data is None:
		return Response(status=400)
	
	homie = Database.get_person(data["homieId"])
	
	if homie is None:
		return Response("This person does not exist.", status=400)
	
	jwt = decode_jwt(jwt_str, options={"verify_signature": False})
	
	if jwt["sub"] == data["homieId"]:
		return Response("You can't add yourself.", status=400)
	
	connection = Connection(jwt["sub"], data["homieId"], data["closeness"])
	Database.set_connection(connection)
	return Response(status=204)


def get_connections(person_id: str) -> Response:
	connections = Database.get_connections(person_id)
	return jsonify({
		"requester": person_id,
		"connections": [c.toJSON() for c in connections]
	})


def create_api(app: Flask) -> None:
	app.add_url_rule(
		"/api/getUser", "get_user", view_func=get_user
	)
	app.add_url_rule(
		"/api/<string:person_id>", "get_person", view_func=get_person
	)
	app.add_url_rule(
		"/api/setConnection", "set_connection",
		methods=["PUT"], view_func=set_connection
	)
	app.add_url_rule(
		"/api/<string:person_id>/connections", "get_connections",
		view_func=get_connections
	)
