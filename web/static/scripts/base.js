/* global window, fetch */
/* eslint-disable func-style, no-unused-vars */

class API {
	static async login() {
		const res = await fetch("/user/login");
		const data = await res.json();
		window.open(await data.authorization_url);
		return {"id": "100082562093592"};
	}

	static async getPerson(id) {
		const data = await fetch(`/api/${id}`);
		return data.json();
	}
}
