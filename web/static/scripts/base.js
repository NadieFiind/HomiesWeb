/* global createUniverse */
/* eslint-disable func-style, no-unused-vars */

function popupMessage(message) {
	const elem = document.querySelector(".popup-message");
	elem.classList.toggle("active");
	elem.textContent = message;
	setTimeout(() => elem.classList.toggle("active"), 5000);
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

		if (res.status === 204) {
			return "Homie successfully added.";
		}

		return res.text();
	}
}

class UserManager {
	static #user = {
		"id": null,
		"data": null
	};

	static #userChangesListeners = [];

	static async register() {
		const user = await API.getUser();

		if (user !== null) {
			UserManager.setUser(user.id, user.data);
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

	static async setGoogleUser(credentialResponse) {
		const jwtString = credentialResponse.credential;
		document.cookie = `jwt=${jwtString}; secure, httpOnly, sameSite=Strict;`;
		await UserManager.register();
	}

	static getUser() {
		return UserManager.#user;
	}

	static async addHomie(personId) {
		if (UserManager.#user.id === null) {
			popupMessage("Please login first.");
		} else {
			const res = await API.addConnection(personId);

			if (res === "Homie successfully added.") {
				createUniverse();
			}

			popupMessage(res);
		}
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
