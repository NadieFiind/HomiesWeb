import json
from typing import Optional, List, Dict, Any


class Connection:
	def __init__(self, person_id: str, closeness: int) -> None:
		self.person_id = person_id
		self.closeness = closeness
	
	def toJSON(self) -> Dict[str, Any]:
		return {
			"id": self.person_id,
			"closeness": self.closeness
		}


class Person:
	def __init__(self, name: str, connections: List[Connection]) -> None:
		self.name = name
		self.connections = connections
	
	def toJSON(self) -> Dict[str, Any]:
		return {
			"name": self.name,
			"connections": [c.toJSON() for c in self.connections]
		}


class Database:
	data: Dict[str, Dict[str, Dict[str, Any]]]
	
	@staticmethod
	def connect() -> None:
		with open("data/data.json") as file:
			Database.data = json.load(file)
	
	@staticmethod
	def get_person(person_id: str) -> Optional[Person]:
		data = Database.data["people"].get(person_id)
		
		if data is None:
			return None
		
		return Person(
			data["name"],
			[Connection(c["id"], c["closeness"]) for c in data["connections"]]
		)
	
	@staticmethod
	def set_person(person_id: str, data: Person) -> None:
		Database.data["people"][person_id] = data.toJSON()
		
		with open("data/data.json", "w") as file:
			json.dump(Database.data, file, indent="\t")
