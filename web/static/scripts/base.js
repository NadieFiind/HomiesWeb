/* eslint-disable func-style, no-unused-vars */

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

		UserManager.loadHomies();
	}

	static async loadHomies() {
		document.querySelector(".homies-list").innerHTML = "";
		for (const connection of UserManager.connections) {
			await UserManager.#addHomieToDOM(connection);
		}
	}

	static async #addHomieToDOM(connection) {
		const user = UserManager.getUser();
		let homieId = null;

		if (connection.person1_id === user.id) {
			homieId = connection.person2_id;
		} else {
			homieId = connection.person1_id;
		}

		const homiesListElem = document.querySelector(".homies-list");
		const elemContainer = document.createElement("div");
		const homie = await API.getPerson(homieId);

		elemContainer.innerHTML = `<div class="homie-info">
			<div>
				<span>Name</span>
				<span class="some-value">${homie.name}</span>
			</div>
		</div>`;

		homiesListElem.appendChild(elemContainer);
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

	static async setGoogleUser(credentialResponse) {
		const jwtString = credentialResponse.credential;
		document.cookie = `jwt=${jwtString}; secure, httpOnly, sameSite=Strict;`;
		await UserManager.register();
	}

	static getUser() {
		return UserManager.#user;
	}

	static async addHomie(personId) {
		let message = "";
		let connectionData = null;

		if (UserManager.#user.id === null) {
			message = "Please login first.";
		} else {
			const res = await API.addConnection(personId);

			// eslint-disable-next-line prefer-destructuring
			message = res.message;
			connectionData = res.data;
		}

		if (connectionData !== null) {
			const index = UserManager.connections.findIndex((c1) => {
				const c1Id = parseInt(c1.person1_id, 10) + parseInt(c1.person2_id, 10);
				const c2Id = parseInt(connectionData.person1_id, 10) + parseInt(connectionData.person2_id, 10);
				return c1Id === c2Id;
			});

			if (index === -1) {
				UserManager.connections.push(connectionData);
				await UserManager.#addHomieToDOM(connectionData);
			}
		}

		return message;
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
