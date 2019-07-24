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
		inst_name = x['signup']['institutionName']
		instdoc = instcol.find_one({"institutionName": re.compile('^' + re.escape(inst_name) + '$', re.IGNORECASE)})
		if (instdoc == None):
			print("Institution not found... create new:" + inst_name)
			logging.error("Institution not found... create new:" + inst_name)

			new_inst = {"institutionShortName": inst_name, "institutionName": inst_name, 
						"institutionAddress": x['signup']['institutionAddress'],
						"nemAddress": "none yet", 'institutionType': "NC",
						"contactNo": x['signup']['contactNo'],
						"creator": creator,
						"createdAt": datetime.now() }
			result = instcol.insert_one(new_inst)
			if (result == None):
				print("Institution insert failed...exiting...")
				logging.error("Institution insert failed...exiting...")
				continue
			else:
				instdoc = instcol.find_one({"institutionShortName": re.compile('^' + re.escape(inst_name) + '$', re.IGNORECASE)})
				
		url = 'http://localhost:8082/api/users?access_token='+tokdoc["_id"]
		jsondata = {"firstname": x['signup']['firstname'], 
					"lastname": x['signup']['lastname'], 
					"institutionShortName": instdoc['institutionShortName'], 
					"roleType": "User", 
					"posTitle": x['signup']['posTitle'],
		    		"contactNo": x['signup']['contactNo'],
		    		"creator": creator,
		    		"institutionId": str(instdoc["_id"]),
		    		"username": x['signup']['email'],
		    		"email": x['signup']['email']
		}
		response = requests.post(url,jsondata)
		if (response.status_code == 200):
			result = 'Success'
			processed += 1
		else:
			result = 'Fail...'+response.text
			unprocessed += 1
			#print('Fail...'+response.text)

		logging.info(	jsondata['firstname']+','+
				jsondata['lastname']+','+
				jsondata['institutionShortName']+','+
				jsondata['roleType']+','+
				jsondata['posTitle']+','+
				jsondata['contactNo']+','+
				jsondata['creator']+','+
				jsondata['institutionId']+','+
				jsondata['username']+','+
				jsondata['email']+','+
				result)
		print(	jsondata['firstname']+','+
				jsondata['lastname']+','+
				jsondata['institutionShortName']+','+
				jsondata['roleType']+','+
				jsondata['posTitle']+','+
				jsondata['contactNo']+','+
				jsondata['creator']+','+
				jsondata['institutionId']+','+
				jsondata['username']+','+
				jsondata['email']+','+
				result)		
		total_signups += 1

total_message = 'Signup run finished. Total Signups: '+str(total_signups)+' Processed: '+str(processed)+' Unprocessed: '+str(unprocessed)
print(total_message)
logging.info(total_message)
