from web.api import create_api
from flask import Flask, render_template

app = Flask(__name__)
create_api(app)


@app.route("/")
def home() -> str:
	return render_template("index.html")
