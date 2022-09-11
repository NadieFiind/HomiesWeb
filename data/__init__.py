import os
from typing import Optional
from data.models import Person
from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore[import]


class Database:
	client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
	_database = client.get_database("HomiesWebDB")
	
	@staticmethod
	async def get_person(person_id: str) -> Optional[Person]:
		collection = Database._database.get_collection("people")
		data = await collection.find_one(person_id)
		
		if data is None:
			return None
		
		return Person(data["name"])
	
	@staticmethod
	async def set_person(person_id: str, data: Person) -> None:
		collection = Database._database.get_collection("people")
		await collection.find_one_and_replace(
			{"_id": person_id}, data.toJSON(), upsert=True
		)
