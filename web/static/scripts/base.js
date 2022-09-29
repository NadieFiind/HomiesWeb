/* global Universe */
/* eslint-disable func-style, no-unused-vars */

/** For debugging. */
function slowdown(seconds = 0.5) {
	const start = new Date().getTime();
	// eslint-disable-next-line no-empty
	while (new Date().getTime() - start < seconds * 1000) {}
}

let popupMessageTimeout = null;
function popupMessage(message) {
	const elem = document.querySelector(".popup-message");
	elem.textContent = message;

	if (elem.classList.contains("active")) {
		clearTimeout(popupMessageTimeout);
	} else {
		elem.classList.add("active");
	}

	popupMessageTimeout = setTimeout(() => elem.classList.remove("active"), 5000);
}

class API {
	static async getUser() {
		const res = await fetch("/api/getUser");

		if (res.status === 401) {
			return null;
		}

		return res.json();
	}

	static async getPerson(personId) {
		const res = await fetch(`/api/${personId}`);

		if (res.status === 404) {
			return null;
		}

		return res.json();
	}

	static async getConnections(personId) {
		const res = await fetch(`/api/${personId}/connections`);
		const data = await res.json();
		return data.connections;
	}

	static async addConnection(personId) {
		const res = await fetch("/api/setConnection", {
			"method": "PUT",
			"headers": {"Content-Type": "application/json"},
			"body": JSON.stringify({
				"homieId": personId,
				"closeness": 1
			})
		});

		if (res.status === 200) {
			return {
				"message": "Homie successfully added.",
				"data": await res.json()
			};
		}

		return {
			"message": await res.text(),
			"data": null
		};
	}

	static async removeConnection(personId) {
		const res = await fetch("/api/removeConnection", {
			"method": "DELETE",
			"headers": {"Content-Type": "application/json"},
			"body": JSON.stringify({"homieId": personId})
		});
		return res.text();
	}
}

class UserManager {
	static #user = {
		"id": null,
		"data": null
	};

	static #userChangesListeners = [];

	static connections = [];

	static async register() {
		const user = await API.getUser();

		if (user !== null) {
			// eslint-disable-next-line require-atomic-updates
			UserManager.connections = await API.getConnections(user.id);
			UserManager.setUser(user.id, user.data);
		}

		document.querySelector(".homies-list-label").textContent += ` (${user.data.homies_count})`;
		UserManager.loadHomies();
	}

	static async loadHomies() {
		document.querySelector(".homies-list").innerHTML = "";
		for (const connection of UserManager.connections) {
			const homieId = UserManager.getConnectionPerson2(connection);
			await UserManager.#addHomieToDOM(homieId);
		}
	}

	static async #addHomieToDOM(homieId) {
		const homie = await API.getPerson(homieId);
		const homiesListElem = document.querySelector(".homies-list");
		const elemContainer = document.createElement("div");

		elemContainer.innerHTML = `<div class="homie-info">
			<div>
				<span>UID</span>
				<button class="homie-uid person-uid button-no-style">${homieId}</button>
			</div>
			<div>
				<span>Name</span>
				<span class="some-value">${homie.name}</span>
			</div>
			<div>
				<button class="remove-homie-btn button-styled-mini">Unhomie</button>
			</div>
		</div>`;

		homiesListElem.appendChild(elemContainer);

		elemContainer.querySelector(".remove-homie-btn").addEventListener(
			"click",
			async (event) => {
				const message = await UserManager.removeHomie(homieId);

				if (message === "Homie successfully removed.") {
					Universe.graph.removeLink(UserManager.getUser().id, homieId);
				}

				popupMessage(message);
			}
		);
		elemContainer.querySelector(".person-uid").addEventListener("click", (event) => {
			navigator.clipboard.writeText(event.target.textContent);
			popupMessage("Copied to clipboard.");
		});
	}

	static #removeHomieToDOM(homieId) {
		const homiesListElem = document.querySelector(".homies-list");

		for (const elem of homiesListElem.querySelectorAll(".homie-uid")) {
			if (elem.textContent === homieId) {
				elem.parentNode.parentNode.parentNode.remove();
			}
		}
	}

	static setUser(userId, userData) {
		UserManager.#user = {
			"id": userId,
			"data": userData
		};

		for (const listener of UserManager.#userChangesListeners) {
			listener();
		}

		for (const element of document.querySelectorAll(".uid")) {
			element.textContent = userId;
		}

		for (const element of document.querySelectorAll(".userName")) {
			element.textContent = userData.name;
		}
	}

	static listenToUserChanges(callback) {
		UserManager.#userChangesListeners.push(callback);
	}

	static setGoogleUser(credentialResponse) {
		const jwtString = credentialResponse.credential;
		document.cookie = `jwt=${jwtString}; secure, httpOnly, sameSite=Strict;`;
		window.location.reload();
	}

	static getUser() {
		return UserManager.#user;
	}

	static async addHomie(personId) {
		let message = "";
		let connectionData = null;

		if (UserManager.getUser().id === null) {
			message = "Please login first.";
		} else {
			const res = await API.addConnection(personId);

			// eslint-disable-next-line prefer-destructuring
			message = res.message;
			connectionData = res.data;
		}

		if (connectionData !== null) {
			const index = UserManager.connections.findIndex((c1) => {
				const c1Id = Graph.getLinkId(c1.person1_id, c1.person2_id);
				const c2Id = Graph.getLinkId(connectionData.person1_id, connectionData.person2_id);
				return c1Id === c2Id;
			});

			if (index === -1) {
				UserManager.connections.push(connectionData);
				await UserManager.#addHomieToDOM(personId);
			}
		}

		return {
			message,
			"homieData": connectionData
				? await API.getPerson(UserManager.getConnectionPerson2(connectionData))
				: null
		};
	}

	static async removeHomie(personId) {
		let message = "";

		if (UserManager.getUser().id === null) {
			message = "Please login first.";
		} else {
			message = await API.removeConnection(personId);
		}

		if (message === "Homie successfully removed.") {
			const index = UserManager.connections.findIndex((c1) => {
				const c1Id = Graph.getLinkId(c1.person1_id, c1.person2_id);
				const c2Id = Graph.getLinkId(UserManager.getUser().id, personId);
				return c1Id === c2Id;
			});

			if (index !== -1) {
				UserManager.connections.splice(index, 1);
				UserManager.#removeHomieToDOM(personId);
			}
		}

		return message;
	}

	static getConnectionPerson2(connection, peson1Id = null) {
		const id = peson1Id || UserManager.getUser().id;

		if (connection.person1_id === id) {
			return connection.person2_id;
		}

		return connection.person1_id;
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
