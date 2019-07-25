import requests
import json
import re
from pymongo import MongoClient
import logging
from datetime import datetime

now = datetime.now()
date_time = now.strftime("%Y.%m.%d")
logging.basicConfig(filename='./logs/signup_run-'+date_time,
                            filemode='a',
                            format='%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s',
                            datefmt='%H:%M:%S',
                            level=logging.DEBUG)


creator = "webadmin"

with open('../server/datasources.json') as json_file:  
    db_data = json.load(json_file)

client = MongoClient(db_data["db"]["host"]+':'+str(db_data["db"]["port"]),username=db_data["db"]["user"], password=db_data["db"]["password"], authSource=db_data["db"]["database"])
mydb = client[db_data["db"]["database"]]
mycol = mydb["transLog"]
usrcol = mydb["user"]
tokcol = mydb["AccessToken"]
instcol = mydb["institution"]

usrdoc = usrcol.find_one({"username": creator})
if (usrdoc == None):
	print("Creator not found...exiting...")
	logging.error("Creator not found...exiting...")
	exit()

tokdoc = tokcol.find_one({"userId": usrdoc["_id"]})
if (tokdoc == None):
	print("Creator token not found...exiting...")
	logging.error("Creator token not found...exiting...")
	exit()


mydoc = mycol.find({"transactionType": 'Signup'})

print("Processing signups...")

processed = 0
unprocessed = 0
total_signups = 0
for x in mydoc:
	email = x['signup']['email']
	
	len = usrcol.count_documents({"email":email})

	if (len == 0):
		url = 'https://api.cosnet.io:8082/api/users?access_token='+tokdoc["_id"]
		jsondata = {"country": x['signup']['country'], 
				"raceId": x['signup']['raceId'], 
				"dob": x['signup']['dob'],
		    		"gender": x['signup']['gender'],
		    		"toImprove": x['signup']['toImprove'],
		    		"ongoingProblems": x['signup']['ongoingProblems'],
		    		"username": x['signup']['email'],
		    		"email": x['signup']['email'],
				"roleType": "User", 
		    		"creator": creator
		}
		response = requests.post(url,jsondata)
		if (response.status_code == 200):
			result = 'Success'
			processed += 1
		else:
			result = 'Fail...'+response.text
			unprocessed += 1
			#print('Fail...'+response.text)

		logging.info(	jsondata['email']+','+
				jsondata['username']+','+
				jsondata['country']+','+
				jsondata['raceId']+','+
				jsondata['dob']+','+
				jsondata['gender']+','+
				",".join(jsondata['toImprove'])+','+
				",".join(jsondata['ongoingProblems'])+','+
				jsondata['creator']+','+
				result)
		print(	jsondata['email']+','+
				jsondata['username']+','+
				jsondata['country']+','+
				jsondata['raceId']+','+
				jsondata['dob']+','+
				jsondata['gender']+','+
				",".join(jsondata['toImprove'])+','+
				",".join(jsondata['ongoingProblems'])+','+
				jsondata['creator']+','+
				result)
		total_signups += 1

total_message = 'Signup run finished. Total Signups: '+str(total_signups)+' Processed: '+str(processed)+' Unprocessed: '+str(unprocessed)
print(total_message)
logging.info(total_message)
