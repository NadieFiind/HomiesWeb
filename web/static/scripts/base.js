/* global window, fetch, jwt_decode */
/* eslint-disable func-style, no-unused-vars */

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

	static setGoogleUser(credentialResponse) {
		const decoded = jwt_decode(credentialResponse.credential);
		UserManager.setUser({"id": decoded.sub});
	}

	static getUser() {
		return UserManager.#user || {"id": "100332899133648192870"};
	}

}

class API {
	static async getPerson(id) {
		const data = await fetch(`/api/${id}`);
		return data.json();
	}
}

window.setGoogleUser = UserManager.setGoogleUser;
