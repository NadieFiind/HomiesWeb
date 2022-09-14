/* global UserManager, popupMessage, Universe */

const togglePanels = (panel) => {
	for (const elem of document.querySelectorAll(".panel")) {
		if (panel.classList.contains("panel-persistent")) {
			if (elem.classList.contains("panel-persistent")) {
				elem.classList.add("active");
				// eslint-disable-next-line no-continue
				continue;
			}
		}

		if (elem === panel) {
			panel.classList.toggle("active");
		} else {
			elem.classList.remove("active");
		}
	}
};

const copyToClipboard = (event) => {
	navigator.clipboard.writeText(event.target.textContent);
	popupMessage("Copied to clipboard.");
};
document.querySelector(".uid").addEventListener("click", copyToClipboard);
document.querySelector(".person-uid").addEventListener("click", copyToClipboard);

document.querySelector(".show-user-info-panel-btn").addEventListener("click", () => {
	const userInfoPanel = document.querySelector(".user-info-panel");
	togglePanels(userInfoPanel);
});

document.querySelector(".show-homies-info-panel-btn").addEventListener("click", () => {
	const homiesInfoPanel = document.querySelector(".homies-info-panel");
	togglePanels(homiesInfoPanel);
});

document.querySelector(".show-help-panel-btn").addEventListener("click", () => {
	const helpPanel = document.querySelector(".help-panel");
	togglePanels(helpPanel);
});

const addHomieForm = document.querySelector(".add-homie-form");
addHomieForm.querySelector("button").addEventListener("click", async () => {
	const personId = addHomieForm.querySelector("[name='person-id']").value;
	const res = await UserManager.addHomie(personId);

	if (res.message === "Homie successfully added.") {
		Universe.graph.addNodeWithLink(
			personId,
			res.homieData.name,
			UserManager.getUser().id,
			"yellow"
		);
		Universe.expand(personId);
	}

	popupMessage(res.message);
});

document.querySelector(".show-homies-btn").addEventListener("click", (event) => {
	const personId = event.target.parentNode.parentNode.querySelector(".person-uid").textContent;
	Universe.expand(personId);
});

(async () => {
	await UserManager.register();
	Universe.create();
})();
