/* global API, UserManager, ForceGraph */

let nodes = {};

const expandGraph = async function expandGraph(personId, graph, graphData, degree) {
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
			graphData.links.push({
				"source": personId,
				"target": cid
			});

		}

		graph.graphData(graphData);
	}

	if (degree - 1 > 0) {
		for (const connection of connections) {
			let cid = null;
			if (connection.person1_id === personId) {
				cid = connection.person2_id;
			} else {
				cid = connection.person1_id;
			}

			await expandGraph(cid, graph, graphData, degree - 1);
		}
	}
};

const createUniverse = async function createUniverse() {
	nodes = {};
	const user = UserManager.getUser();
	const person = await API.getPerson(user.id);
	const node = person ? {
		"id": user.id,
		"name": person.name,
		"color": "green"
	} : {};
	const graphData = {
		"nodes": person ? [node] : [],
		"links": []
	};
	const container = document.querySelector(".graph");
	const graph = new ForceGraph()(container).
		width(container.clientWidth).
		height(container.clientHeight).
		backgroundColor("#a19b95").
		graphData(graphData);

	if (person) {
		nodes[user.id] = node;
		expandGraph(user.id, graph, graphData, 2);
	}
};

UserManager.listenToUserChanges(createUniverse);
createUniverse();

const addHomieForm = document.querySelector(".addHomieForm");
addHomieForm.querySelector("button").addEventListener("click", () => {
	const personId = addHomieForm.querySelector("[name='personId']").value;
	UserManager.addHomie(personId);
});
