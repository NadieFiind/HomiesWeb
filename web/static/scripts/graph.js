/* global API, UserManager, ForceGraph, togglePanels */

class Graph {
	constructor(container, onNodeClick) {
		this.container = container;
		this.nodes = {};
		this.links = {};
		this.graph = new ForceGraph()(this.container).
			width(this.container.clientWidth).
			height(this.container.clientHeight).
			backgroundColor("#18181b").
			onNodeClick(onNodeClick);
	}

	update() {
		this.graph.graphData({
			"nodes": Object.values(this.nodes),
			"links": Object.values(this.links)
		});
	}

	hasNode(nodeId) {
		for (const key in this.nodes) {
			if (key === nodeId) {
				return true;
			}
		}
		return false;
	}

	hasLink(node1Id, node2Id) {
		const linkId = Graph.getLinkId(node1Id, node2Id);

		for (const key of Object.keys(this.links)) {
			if (key === linkId) {
				return true;
			}
		}

		return false;
	}

	addNode(id, name) {
		if (!this.hasNode(id)) {
			this.nodes[id] = {
				id,
				name,
				"val": 1,
				"color": "green"
			};
			this.update();
		}
	}

	addNodeWithLink(id, name, targetId, color = "white") {
		const node = {
			id,
			name,
			"val": 1
		};
		const link = {
			"source": id,
			"target": targetId,
			color
		};
		const linkId = Graph.getLinkId(id, targetId);
		let updateGraph = false;

		if (!this.hasNode(id)) {
			this.nodes[id] = node;
			updateGraph = true;
		}

		if (!this.hasLink(id, targetId)) {
			this.links[linkId] = link;
			updateGraph = true;
		}

		if (updateGraph) {
			this.update();
		}
	}

	removeLink(node1Id, node2Id) {
		if (!this.hasLink(node1Id, node2Id)) {
			const linkId = Graph.getLinkId(node1Id, node2Id);
			delete this.links[linkId];
			this.update();
		}
	}

	static getLinkId(node1Id, node2Id) {
		return [node1Id, node2Id].sort().join("-");
	}
}

// eslint-disable-next-line no-unused-vars
class Universe {
	static maxPopulation = 1000;

	static stopExpansion = false;

	static graph = new Graph(document.querySelector(".graph"), (node) => {
		const personInfoPanel = document.querySelector(".person-info-panel");
		personInfoPanel.querySelector(".person-uid").textContent = node.id;
		personInfoPanel.querySelector(".person-name").textContent = node.name;
		togglePanels(personInfoPanel);
	});

	static create() {
		const user = UserManager.getUser();
		if (user.id !== null) {
			if (Universe.maxPopulation <= 1) {
				Universe.stopExpansion = true;
			}

			Universe.graph.addNode(user.id, user.data.name);
			Universe.expand(user.id, 1);
		}
	}

	static async expand(personId, deep = 0) {
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
			const cid = UserManager.getConnectionPerson2(connection, personId);
			const cperson = await API.getPerson(cid);
			Universe.graph.addNodeWithLink(cid, cperson.name, personId);

			if (Universe.graph.nodes.length >= Universe.maxPopulation) {
				Universe.stopExpansion = true;
				return;
			}
		}

		if (deep > 0) {
			for (const connection of connections) {
				if (Universe.stopExpansion) {
					return;
				}

				const cid = UserManager.getConnectionPerson2(connection, personId);
				await Universe.expand(cid, deep - 1);
			}
		}
	}
}
