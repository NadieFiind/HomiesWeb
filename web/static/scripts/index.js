/* global API, UserManager, ForceGraph, popupMessage */

const maxPeople = 1000;
const homiesDegree = 3;
let stopUniverseExpansion = false;

const togglePanels = (panel) => {
	for (const elem of document.querySelectorAll(".panel")) {
		if (panel.classList.contains("panel-persistent")) {
			if (elem.classList.contains("panel-persistent")) {
				elem.classList.add("active");
				break;
			}
		}

		if (elem === panel) {
			panel.classList.toggle("active");
		} else {
			elem.classList.remove("active");
		}
	}
};

let nodes = {};
const container = document.querySelector(".graph");
const graph = new ForceGraph()(container).
	width(container.clientWidth).
	height(container.clientHeight).
	backgroundColor("#18181b").
	onNodeClick((node) => {
		const personInfoPanel = document.querySelector(".person-info-panel");
		personInfoPanel.querySelector(".person-uid").textContent = node.id;
		personInfoPanel.querySelector(".person-name").textContent = node.name;
		togglePanels(personInfoPanel);
	});

const expandUniverse = async (personId, graphData, degree) => {
	if (stopUniverseExpansion) {
		return;
	}

	const connections = await API.getConnections(personId);

	for (const connection of connections) {
		let cid = null;
		if (connection.person1_id === personId) {
			cid = connection.person2_id;
		} else {
			cid = connection.person1_id;
		}

		const cperson = await API.getPerson(cid);
		const node = {
			"id": cid,
			"name": cperson.name,
			"val": connection.closeness
		};

		if (!(cid in nodes)) {
			nodes[cid] = node;
			graphData.nodes.push(node);
		}

		graphData.links.push({
			"source": personId,
			"target": cid,
			"color": "white"
		});
		graph.graphData(graphData);

		if (graphData.nodes.length >= maxPeople) {
			stopUniverseExpansion = true;
			return;
		}
	}

	if (degree - 1 > 0) {
		for (const connection of connections) {
			if (stopUniverseExpansion) {
				return;
			}

			let cid = null;
			if (connection.person1_id === personId) {
				cid = connection.person2_id;
			} else {
				cid = connection.person1_id;
			}

			await expandUniverse(cid, graphData, degree - 1);
		}
	}
};

const createUniverse = () => {
	nodes = {};
	const user = UserManager.getUser();
	const person = user.data;
	const node = person ? {
		"id": user.id,
		"name": person.name,
		"color": "green"
	} : {};
	const graphData = {
		"nodes": person ? [node] : [],
		"links": []
	};
	graph.graphData(graphData);

	if (person) {
		nodes[user.id] = node;

		if (maxPeople <= 1) {
			stopUniverseExpansion = true;
		}

		expandUniverse(user.id, graphData, homiesDegree);
	}
};

UserManager.listenToUserChanges(createUniverse);
createUniverse();

const copyUidToClipboard = (event) => {
	navigator.clipboard.writeText(event.target.textContent);
	popupMessage("Copied to clipboard.");
};
document.querySelector(".uid").addEventListener("click", copyUidToClipboard);
document.querySelector(".person-uid").addEventListener("click", copyUidToClipboard);

document.querySelector(".show-user-info-panel-btn").addEventListener("click", () => {
	const userInfoPanel = document.querySelector(".user-info-panel");
	togglePanels(userInfoPanel);
});

document.querySelector(".show-homies-info-panel-btn").addEventListener("click", () => {
	const homiesInfoPanel = document.querySelector(".homies-info-panel");
	togglePanels(homiesInfoPanel);
});

const addHomieForm = document.querySelector(".add-homie-form");
addHomieForm.querySelector("button").addEventListener("click", () => {
	const personId = addHomieForm.querySelector("[name='person-id']").value;
	UserManager.addHomie(personId);
});
