from typing import Dict, Any


class Connection:
	def __init__(self, person1_id: str, person2_id: str, closeness: int) -> None:
		self.person1_id = person1_id
		self.person2_id = person2_id
		self.closeness = closeness
	
	def toJSON(self) -> Dict[str, Any]:
		return {
			"person1_id": self.person1_id,
			"person2_id": self.person2_id,
			"closeness": self.closeness
		}


class Person:
	def __init__(self, name: str, *, homies_count: int = 0) -> None:
		self.name = name
		self.homies_count = homies_count
	
	def toJSON(self) -> Dict[str, Any]:
		return {
			"name": self.name,
			"homies_count": self.homies_count
		}
