import os
from pymongo import MongoClient
from typing import Optional, Dict, Any
from data.models import Person, Connection


class Database:
	client = MongoClient(os.getenv("MONGODB_URI"))  # type: ignore[var-annotated]
	_database = client.get_database("HomiesWebDB")
	
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
		collection.find_one_and_replace(
			{"_id": person_id}, data.toJSON(), upsert=True
		)
	
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
