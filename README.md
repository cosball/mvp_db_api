# Cosball MVP DB API
This is the MongoDB API. All access to the Vault Mongo DB pass through this API Server.

## Environment Setup ##
1. Install MongoDB database in your local machine.
   * Windows OS:    
   1. Download the MongoDB
   2. Follow 'normal setup instructions'
   3. Create the following folder - C:\data\db
   4. Navigate to bin folder
         ```
        cd C:\Program Files\MongoDB\Server\<version>\bin>
         ```
   5. Run the following command 
        ```
        mongod
   5. The mongodb server will start at port 27017 by default
   
2. NodeJS and NPM (use LTS version)
   * Windows OS: 
     1. Install Chocolatey (Run as administrator):
     ```
     @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
     ```
     2. Install NVM: 
     ```
     choco install nvm
     ```
     3. Install NodeJS v8 or higher (LTS) using NVM: 
     ```
     nvm install latest
     ```
     4. Switch to NodeJS v8 (LTS) (required step for every new instance of Command Prompt. Windows' version of NVM does not support default aliasing): 
     ```
     nvm use 12.2.0 
     ```
   * Mac OS:
     1. Install Brew: **http://brew.sh/**
     2. Install NVM: **https://github.com/creationix/nvm#install-script**
     3. Install NodeJS using NVM: 
     ```
     nvm install --lts=carbon
     ```
     4. Set default NodeJS version: 
     ```
     nvm alias default lts/carbon && source ~/.bash_profile
     ```

1. Clone this project: **git clone https://gitlab.com/thevaultlab/scan-demo-db-api.git**
2. npm install
3. Navigate to scan-demo-db-api folder: `cd scan-demo-db-api`
4. Define an admin user: `cd server/boot` and  `mv add_admin_user add_admin_user.js` and edit the `add_admin_user.js` to define your admin user name and password.
5. Define MongoDB connection: The mongoDB datasource default is for the Dev Environment. To use PROD, TEST amd LOCAL DB environment, `cd server` and  rename the `datasources.json-<env>`, where <env> is prod, test, local, and dev, to `datasources.json`.
6. Define Environment Configuration: The default envronment is for the Dev Environment. To switch to PROD or DEV environment, `cd server` and  rename the `config.json-<env>`, where <env> is prod, and dev, to `config.json`. 
7. To run the API: `node .` The API is listening at **http://localhost:3000**
8. Go to the API Explorer for more information on the API Specs at **http://localhost:3000/explorer**
9. Rename the `add_admin_user.js` to `add_admin_user` to bypass admin creation on subsequent runs.
10. Define an API admin user: `cd server/boot` and  `mv add_api_user add_api_user.js` and edit the `add_add_api_user.js` to define your API admin user name and password.
11. Re-run the project so that API user will be created.
12. Rename the `add_api_user.js` to `add_api_user` to bypass API admin creation on subsequent runs.
