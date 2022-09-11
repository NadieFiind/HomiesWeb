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
	const container = document.querySelector(".graph");
	const graph = new ForceGraph()(container).
		width(container.clientWidth).
		height(container.clientHeight).
		backgroundColor("#101419").
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

const addHomieForm = document.querySelector(".addHomieForm");
addHomieForm.querySelector("button").addEventListener("click", () => {
	const personId = addHomieForm.querySelector("[name='personId']").value;
	UserManager.addHomie(personId);
});
