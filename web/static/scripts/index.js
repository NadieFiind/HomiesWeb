/* global API, UserManager, ForceGraph, popupMessage */

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

class Universe {
	static maxPopulation = 1000;

	static homiesDegree = 3;

	static stopExpansion = false;

	static container = document.querySelector(".graph");

	static graph = new ForceGraph()(Universe.container).
		width(Universe.container.clientWidth).
		height(Universe.container.clientHeight).
		backgroundColor("#18181b").
		onNodeClick((node) => {
			const personInfoPanel = document.querySelector(".person-info-panel");
			personInfoPanel.querySelector(".person-uid").textContent = node.id;
			personInfoPanel.querySelector(".person-name").textContent = node.name;
			togglePanels(personInfoPanel);
		});

	static nodes = {};

	static links = {};

	static graphData = {};

	static create() {
		Universe.nodes = {};
		Universe.links = {};

		const user = UserManager.getUser();
		const person = user.data;
		const node = person ? {
			"id": user.id,
			"name": person.name,
			"color": "green"
		} : {};
		Universe.graphData = {
			"nodes": person ? [node] : [],
			"links": []
		};

		Universe.graph.graphData(Universe.graphData);

		if (person) {
			Universe.nodes[user.id] = node;

			if (Universe.maxPopulation <= 1) {
				Universe.stopExpansion = true;
			}

			Universe.expand(user.id, Universe.homiesDegree);
		}
	}

	static async expand(personId, degree) {
		if (Universe.stopExpansion) {
			return;
		}

		let connections = [];

		if (personId === UserManager.getUser().id) {
			// eslint-disable-next-line prefer-destructuring
			connections = UserManager.connections;
		} else {
			connections = await API.getConnections(personId);
		}

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
				"val": 1
			};
			const link = {
				"source": personId,
				"target": cid,
				"color": "white"
			};
			const linkId = parseInt(personId, 10) + parseInt(cid, 10);

			if (!(cid in Universe.nodes)) {
				Universe.nodes[cid] = node;
				Universe.graphData.nodes.push(node);
			}

			if (!(linkId in Universe.links)) {
				Universe.links[linkId] = link;
				Universe.graphData.links.push(link);
			}

			Universe.graph.graphData(Universe.graphData);

			if (Universe.graphData.nodes.length >= Universe.maxPopulation) {
				Universe.stopExpansion = true;
				return;
			}
		}

		if (degree - 1 > 0) {
			for (const connection of connections) {
				if (Universe.stopExpansion) {
					return;
				}

				let cid = null;
				if (connection.person1_id === personId) {
					cid = connection.person2_id;
				} else {
					cid = connection.person1_id;
				}

				await Universe.expand(cid, degree - 1);
			}
		}
	}
}

const copyToClipboard = (event) => {
	navigator.clipboard.writeText(event.target.textContent);
	popupMessage("Copied to clipboard.");
};
document.querySelector(".uid").addEventListener("click", copyToClipboard);
document.querySelector(".person-uid").addEventListener("click", copyToClipboard);

document.querySelector(".show-user-info-panel-btn").addEventListener("click", () => {
	const userInfoPanel = document.querySelector(".user-info-panel");
	togglePanels(userInfoPanel);
});

document.querySelector(".show-homies-info-panel-btn").addEventListener("click", () => {
	const homiesInfoPanel = document.querySelector(".homies-info-panel");
	togglePanels(homiesInfoPanel);
});

const addHomieForm = document.querySelector(".add-homie-form");
addHomieForm.querySelector("button").addEventListener("click", async () => {
	const personId = addHomieForm.querySelector("[name='person-id']").value;
	const message = await UserManager.addHomie(personId);

	if (message === "Homie successfully added.") {
		const userId = UserManager.getUser().id;
		const link = {
			"source": userId,
			"target": personId,
			"color": "yellow"
		};
		const linkId = parseInt(userId, 10) + parseInt(personId, 10);

		Universe.links[linkId] = link;
		Universe.graphData.links.push(link);
		Universe.graph.graphData(Universe.graphData);
	}

	popupMessage(message);
});

UserManager.listenToUserChanges(Universe.create);
Universe.create();
