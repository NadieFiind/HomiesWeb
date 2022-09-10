import json
from typing import Dict, Any

with open("data/data.json") as file:
	data: Dict[str, Dict[str, Dict[str, Any]]] = json.load(file)
