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
		backgroundColor("#a19b95").
		graphData(graphData);
	const connections = await API.getConnections(user.id);

	if (person) {
		for (const connection of connections) {
			let cid = null;
			if (connection.person1_id === user.id) {
				cid = connection.person2_id;
			} else {
				cid = connection.person1_id;
			}

			const cperson = await API.getPerson(cid);

			graphData.nodes.push({
				"id": cid,
				"name": cperson.name,
				"val": connection.closeness
			});
			graphData.links.push({
				"source": user.id,
				"target": cid
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
