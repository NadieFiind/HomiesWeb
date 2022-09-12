/* global jwt_decode */
/* eslint-disable func-style, no-unused-vars */

function popupMessage(message) {
	const elem = document.querySelector(".popup-message");
	elem.classList.toggle("active");
	elem.textContent = message;
	setTimeout(() => elem.classList.toggle("active"), 5000);
}

class API {
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

	static async setPerson(decodedJwt) {
		const res = await fetch("/api/setPerson", {
			"method": "PUT",
			"headers": {"Content-Type": "application/json"},
			"body": JSON.stringify(decodedJwt)
		});
		return res.json();
	}

	static async addConnection(personId) {
		const payload = {
			"homieId": personId,
			"closeness": 1,
			"token": jwt_decode(sessionStorage.getItem("jwt"))
		};

		const res = await fetch("/api/setConnection", {
			"method": "PUT",
			"headers": {"Content-Type": "application/json"},
			"body": JSON.stringify(payload)
		});

		if (res.status === 204) {
			return "Homie successfully added.";
		}

		return res.text();
	}
}

class UserManager {
	static #user = null;

	static #userChangesListeners = [];

	static setUser(userId, userData) {
		UserManager.#user = {"id": userId};

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
		sessionStorage.setItem("jwt", credentialResponse.credential);
		const decoded = jwt_decode(credentialResponse.credential);
		let user = await API.getPerson(decoded.sub);

		if (user === null) {
			user = await API.setPerson(decoded);
		}

		UserManager.setUser(decoded.sub, user);
	}

	static async setUserFromJwt(jwt) {
		const decoded = jwt_decode(jwt);
		let user = await API.getPerson(decoded.sub);

		if (user === null) {
			user = await API.setPerson(decoded);
		}

		UserManager.setUser(decoded.sub, user);
	}

	static getUser() {
		return UserManager.#user || {"id": null};
	}

	static async addHomie(personId) {
		if (sessionStorage.getItem("jwt") === null) {
			popupMessage("Please login first.");
		} else {
			const res = await API.addConnection(personId);
			popupMessage(res);
		}
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
