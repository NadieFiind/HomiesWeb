import os
from data import Database
from web.api import create_api
from flask import Flask, render_template

app = Flask(__name__)
create_api(app)


@app.route("/")
def home() -> str:
	return render_template(
		"index.html",
		TOTAL_USERS=Database.get_people_count(),
		GOOGLE_OAUTH_CLIENT_ID=os.getenv("GOOGLE_OAUTH_CLIENT_ID")
	)
