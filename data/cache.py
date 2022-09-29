from data.models import Person
from collections import OrderedDict
from typing import Optional, TypeVar, Generic

Type = TypeVar("Type")


class LimitedSizeDict(Generic[Type], OrderedDict[str, Type]):
	def __init__(self, size_limit: int) -> None:
		super().__init__()
		self.size_limit = size_limit
		self._check_size_limit()
	
	def __setitem__(self, key: str, value: Type) -> None:
		super().__setitem__(key, value)
		self._check_size_limit()
	
	def _check_size_limit(self) -> None:
		while len(self) > self.size_limit:
			self.popitem(last=False)


class DatabaseCache:
	def __init__(self) -> None:
		self.person = LimitedSizeDict[Person](1000)
	
	def get_person(self, person_id: str) -> Optional[Person]:
		return self.person.get(person_id)
	
	def set_person(self, person_id: str, person: Person) -> Person:
		self.person[person_id] = person
		return person
