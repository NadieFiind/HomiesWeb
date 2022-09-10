/* global getPerson, ForceGraph */

const renderUniverse = async function renderUniverse(personId) {
	const person = await getPerson(personId);
	const graphData = {
		"nodes": person ? [
			{
				"id": personId,
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
			const cperson = await getPerson(connection.id);

			graphData.nodes.push({
				"id": connection.id,
				"name": cperson.name,
				"val": connection.closeness
			});
			graphData.links.push({
				"source": personId,
				"target": connection.id
			});

			graph.graphData(graphData);
		}
	}
};

renderUniverse("100082562093592");
