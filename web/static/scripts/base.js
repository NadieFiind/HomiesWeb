/* global window, fetch, jwt_decode */
/* eslint-disable func-style, no-unused-vars */

class API {
	static async getPerson(id) {
		const res = await fetch(`/api/${id}`);
		const data = await res.json();
		return data;
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
	}

	static listenToUserChanges(callback) {
		UserManager.#userChangesListeners.push(callback);
	}

	static async setGoogleUser(credentialResponse) {
		const decoded = jwt_decode(credentialResponse.credential);

		if (await API.getPerson(decoded.sub) === null) {
			await fetch("/api/setPerson", {
				"method": "PUT",
				"headers": {"Content-Type": "application/json"},
				"body": JSON.stringify(decoded)
			});
		}

		UserManager.setUser({"id": decoded.sub});
	}

	static getUser() {
		return UserManager.#user || {"id": "100332899133648192870"};
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
