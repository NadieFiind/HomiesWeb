import os
from pymongo import MongoClient
from data.models import Person, Connection
from typing import Optional, Dict, Any, List, Union


class Database:
	client = MongoClient(os.getenv("MONGODB_URI"))  # type: ignore[var-annotated]
	_database = client.get_database("HomiesWebDB")
	_people_count: Union[None, int] = None
	
	@staticmethod
	def get_people_count() -> int:
		if Database._people_count is None:
			collection = Database._database.get_collection("people")
			Database._people_count = collection.estimated_document_count()
		
		return Database._people_count
	
	@staticmethod
	def get_person(person_id: str) -> Optional[Person]:
		collection = Database._database.get_collection("people")
		data = collection.find_one(person_id)
		
		if data is None:
			return None
		
		return Person(data["name"])
	
	@staticmethod
	def set_person(person_id: str, data: Person) -> None:
		collection = Database._database.get_collection("people")
		doc: Optional[Dict[str, Any]] = collection.find_one_and_replace(
			{"_id": person_id}, data.toJSON(), upsert=True
		)
		
		if doc is None:
			if Database._people_count is None:
				Database.get_people_count()
			
			Database._people_count += 1  # type: ignore[operator]
	
	@staticmethod
	def set_connection(connection: Connection) -> None:
		collection = Database._database.get_collection("connections")
		data: Optional[Dict[str, Any]] = collection.find_one({
			"person1_id": connection.person1_id,
			"person2_id": connection.person2_id
		})
		
		if data is None:
			data = collection.find_one({
				"person1_id": connection.person2_id,
				"person2_id": connection.person1_id
			})
		
		if data is None:
			collection.insert_one(connection.toJSON())
			return
		
		collection.find_one_and_replace(
			{"_id": data["_id"]}, connection.toJSON()
		)
	
	@staticmethod
	def remove_connection(connection: Connection) -> None:
		collection = Database._database.get_collection("connections")
		data: Optional[Dict[str, Any]] = collection.find_one({
			"person1_id": connection.person1_id,
			"person2_id": connection.person2_id
		})
		
		if data is None:
			data = collection.find_one({
				"person1_id": connection.person2_id,
				"person2_id": connection.person1_id
			})
		
		if data is not None:
			collection.delete_one({"_id": data["_id"]})
	
	@staticmethod
	def get_connections(person_id: str) -> List[Connection]:
		collection = Database._database.get_collection("connections")
		c1 = collection.find({"person1_id": person_id})
		c2 = collection.find({"person2_id": person_id})
		connections = []
		
		for data in c1:
			connections.append(Connection(
				data["person1_id"], data["person2_id"], data["closeness"]
			))
		
		for data in c2:
			connections.append(Connection(
				data["person1_id"], data["person2_id"], data["closeness"]
			))
		
		return connections
