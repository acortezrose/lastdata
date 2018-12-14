import urllib.request, urllib.parse, urllib.error
import json
import sqlite3
import lastfm_info

serviceurl = "https://ws.audioscrobbler.com/2.0/?method="

# takes in a string <user>, puts my last.fm top 100 artist data into sqlite database
def get_topartists(user):
	path = "lastfm.sqlite"
	conn = sqlite3.connect(path)
	cur = conn.cursor()
	setUpTable(conn, cur)

	url = serviceurl + "user.gettopartists&user=" + user + "&api_key=" + lastfm_info.devkey + "&limit=100&format=json"
	url2database(url, cur, conn)


# takes a database connection and cursor, creates the artists table in the database if 
# it doesn't already exist
def setUpTable(conn, cur):
	cur.execute("""DROP TABLE IF EXISTS artists""")
	cur.execute("""CREATE TABLE artists (artist_name TEXT, my_plays INTEGER, all_plays INTEGER)""")
	conn.commit()


# helper function
# takes string <x>, returns <x> with non-ascii characters removed
def make_ascii(x):
	return ''.join(i if ord(i) < 128 else '' for i in x)



# helper function
# takes <url> and opens it, loading JSON 
def openurl(url):
	uh = urllib.request.urlopen(url)
	data = uh.read().decode()

	try:	js = json.loads(data)
	except:		js = None

	if not js:
		print("--- failed to retrieve data ---")
		print(data)

	return js


# takes url and database connection and cursor, commits data from url to the database
# including  top artists names, my plays, and total plays
def url2database(url, cur, conn):
	js = openurl(url)

	for artist in js["topartists"]["artist"]:
		name = artist["name"]
		myplays = artist["playcount"]

		# quick and nasty solution to non english artist names
		if name == "アナログフィッシュ":
			name = "analog fish"

		url = serviceurl + "artist.getinfo&artist=" + make_ascii(name).lower() + "&api_key=" + lastfm_info.devkey + "&format=json"
		artistjs = openurl(url)

		allplays = artistjs["artist"]["stats"]["playcount"]
		print(name, "my plays: ", myplays, "all plays: ", allplays)

		cur.execute("""INSERT OR IGNORE INTO artists 
			(artist_name, my_plays, all_plays)
			VALUES (?, ?, ?)""", (name, int(myplays), int(allplays)))
		conn.commit()
		

get_topartists("acortezr")
