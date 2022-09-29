from datetime import datetime
from data.models import Person
from collections import OrderedDict
from typing import Optional, TypeVar, Generic, Dict

Type = TypeVar("Type")


class CacheData(Generic[Type], OrderedDict[str, Type]):
	def __init__(self, size_limit: int) -> None:
		super().__init__()
		self.size_limit = size_limit
		self._lifetime: Dict[str, datetime] = {}
		self._check_size_limit()
	
	def __setitem__(self, key: str, value: Type) -> None:
		super().__setitem__(key, value)
		self._lifetime[key] = datetime.now()
		self._check_size_limit()
	
	def get(self, key: str) -> Optional[Type]:  # type: ignore
		date_created = self._lifetime.get(key)
		
		if date_created is None:
			return None
		
		# One hour lifetime
		if (datetime.now() - date_created).total_seconds() >= 60 * 60:
			del self._lifetime[key]
			del self[key]
			return None
		
		return super().get(key)
	
	def _check_size_limit(self) -> None:
		while len(self) > self.size_limit:
			self.popitem(last=False)


class DatabaseCache:
	def __init__(self) -> None:
		self.person = CacheData[Person](1000)
	
	def get_person(self, person_id: str) -> Optional[Person]:
		return self.person.get(person_id)
	
	def set_person(self, person_id: str, person: Person) -> Person:
		self.person[person_id] = person
		return person
