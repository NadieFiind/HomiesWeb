/* global API, UserManager, ForceGraph */

const createUniverse = async function createUniverse() {
	const user = UserManager.getUser();
	const person = await API.getPerson(user.id);
	const graphData = {
		"nodes": person ? [
			{
				"id": user.id,
				"name": person.name,
				"color": "green"
			}
		] : [],
		"links": []
	};
	const graph = new ForceGraph()(document.querySelector(".graph")).
		graphData(graphData);

	if (person) {
		for (const connection of person.connections) {
			const cperson = await API.getPerson(connection.id);

			graphData.nodes.push({
				"id": connection.id,
				"name": cperson.name,
				"val": connection.closeness
			});
			graphData.links.push({
				"source": user.id,
				"target": connection.id
			});

			graph.graphData(graphData);
		}
	}
};

UserManager.listenToUserChanges(createUniverse);
createUniverse();
