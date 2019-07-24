import requests
import json
import re
import sys
import os
from pymongo import MongoClient
import logging
from datetime import datetime

if ( len(sys.argv) != 2 ):
	print "Usage: {} datafile".format(sys.argv[0])
	exit()

with open('../server/datasources.json') as json_file:  
	db_data = json.load(json_file)

client = MongoClient(db_data["db"]["host"]+':'+str(db_data["db"]["port"]),username=db_data["db"]["user"], password=db_data["db"]["password"], authSource=db_data["db"]["database"])
mydb = client[db_data["db"]["database"]]

tableName = os.path.splitext(sys.argv[1])[0]
print tableName
table = mydb[tableName]

filepath = sys.argv[1]
with open(filepath) as fp:
	line = fp.readline()
	cnt = 1
	while line:
		new_country = { "name": line.strip(), "seq":cnt }
		result = table.insert_one(new_country)
		if (result == None):
			print("{} failed...".format(line))
		line = fp.readline()
		cnt += 1

fp.close()
