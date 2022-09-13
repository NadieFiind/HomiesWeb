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
		let message = "";

		if (UserManager.#user.id === null) {
			message = "Please login first.";
		} else {
			const res = await API.addConnection(personId);
			message = res;
		}

		return message;
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
