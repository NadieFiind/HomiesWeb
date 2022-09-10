/* global fetch */
/* eslint-disable func-style, no-unused-vars */

async function getPerson(id) {
	const data = await fetch(`/api/${id}`);
	return data.json();
}
