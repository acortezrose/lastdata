# data.py
import sqlite3, json, csv

# takes in a filename and database cur, produces a js file of the data 
# with listening percentages for each artist
def exportData(cur, filename):
	ddd = {"artists": [] }
	rows = cur.execute("""SELECT * FROM artists""")

	for row in rows:
		quotient = 0
		if row[2] > 0:
			quotient = "{0:.6f}".format(row[1]/row[2])
		ddd["artists"].append({"name": row[0], "myListens": row[1], "quotient": quotient})

	dumped_cache = json.dumps(ddd)
	fw = open(filename, 'w')
	fw.write("var DATA = ")
	fw.write(dumped_cache)
	fw.close

# takes in a filename and database cur, produces a tsv file of the data
# with listening percentages for each artist
def makeReport(cur, filename):
	outfile = open(filename, 'w')
	tsv_write = csv.writer(outfile, delimiter="\t")
	tsv_write.writerow(["artistName", "myListens", "quotient"])

	rows = cur.execute("""SELECT * FROM artists""")

	for row in rows:
		quotient = 0
		if row[2] > 0:
			quotient = "{0:.6f}".format(row[1]/row[2])
		tsv_write.writerow([row[0], row[1], quotient])

	outfile.close()


path = "lastfm.sqlite"
conn = sqlite3.connect(path)
cur = conn.cursor()

exportData(cur, "js/artist_data.js")
makeReport(cur, "artist_data.tsv")