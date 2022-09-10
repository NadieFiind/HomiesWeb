from web import app
from data import Database

if __name__ == "__main__":
	Database.connect()
	app.run(port=8080, host="0.0.0.0", debug=True)
