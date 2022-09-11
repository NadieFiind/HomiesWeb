/* global jwt_decode */
/* eslint-disable func-style, no-unused-vars */

class API {
	static async getPerson(id) {
		const res = await fetch(`/api/${id}`);

		if (res.status === 404) {
			return null;
		}

		return res.json();
	}

	static async setPerson(decodedJwt) {
		await fetch("/api/setPerson", {
			"method": "PUT",
			"headers": {"Content-Type": "application/json"},
			"body": JSON.stringify(decodedJwt)
		});
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

	static setUser(user) {
		UserManager.#user = user;

		for (const listener of UserManager.#userChangesListeners) {
			listener();
		}

		for (const element of document.querySelectorAll(".uid")) {
			element.textContent = user.id;
		}
	}

	static listenToUserChanges(callback) {
		UserManager.#userChangesListeners.push(callback);
	}

	static async setGoogleUser(credentialResponse) {
		sessionStorage.setItem("jwt", credentialResponse.credential);
		const decoded = jwt_decode(credentialResponse.credential);

		if (await API.getPerson(decoded.sub) === null) {
			await API.setPerson(decoded);
		}

		UserManager.setUser({"id": decoded.sub});
	}

	static async setUserFromJwt(jwt) {
		const decoded = jwt_decode(jwt);

		if (await API.getPerson(decoded.sub) === null) {
			await API.setPerson(decoded);
		}

		UserManager.setUser({"id": decoded.sub});
	}

	static getUser() {
		return UserManager.#user || {"id": null};
	}

	static async addHomie(personId) {
		if (sessionStorage.getItem("jwt") === null) {
			document.querySelector(".server-message").textContent = "Please login first.";
		} else {
			const res = await API.addConnection(personId);
			document.querySelector(".server-message").textContent = res;
		}
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
