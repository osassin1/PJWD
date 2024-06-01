The Family Shopping List web-app’s goal is to improve the planning and shopping of grocery items in real brick-and-mortar stores. Families can plan ahead and add to a shared shopping list to communicate in a collaborative way what items are needed. Family members can create, modify, and remove items of a store’s inventory, for example, if certain products are no longer desired or available. All participating families share the same inventory data and can exchange ideas on a family-to-family bases.

While in the store shopping for the items from the shopping list, family members can still add more items to the list. The app keeps everyone up-to-date in almost real-time with a delay of 5 to 10 seconds. Once in shopping mode, family member can check off items from the list, which means that these items are now in the shopping cart. After checking out at the register, the shopping list can be closed.

A mobile-first and responsive web design guided the development of the entire app. Hosting the web-app with a web server, for example, Apache Tomcat, was easily accomplished.

Installation for Ubuntu 22

1. Install npm and Node.js

Update the linux environment and install npm

    sudo apt update

Upgrade: 

    sudo apt upgrade

Install npm:

    sudo apt install npm

Install angular cli:

    sudo npm install -g @angular/cli

Check version of node.js

    node -v

If the version is less than 16, update Node.js:
  
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

Check the changes and then use the changes:

    source ~/.bashrc

Take a look at all available versions:

    nvm list-remote

Install version 20.11.0:

    nvm install v20.11.0

For more info, please refer to:

    https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-3-installing-node-using-the-node-version-manager

2. Install MySQL

Follow the directions outlined here - step 1 is sufficient to get started:

    https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-22-04

Access the MySQL terminal:

    sudo mysql

This for a new MySQL installation and creating a new user. Use your sql terminal and create the default settings:

    CREATE USER 'shopping_list'@'localhost' IDENTIFIED BY 'airY@Shop99';

Grant the following:

    GRANT CREATE, ALTER, DROP, INSERT, UPDATE, INDEX, DELETE, SELECT, REFERENCES, RELOAD on *.* TO 'shopping_list'@'localhost' WITH GRANT OPTION;

Login in as shopping_list and create database:

    CREATE SCHEMA `shopping_list_db` ;

Exit the MySQL terminal session:

    exit

3. Install the app from github

Clone the repository from github.com:

    git clone https://github.com/osassin1/PJWD.git

Change directory to PJWD:

    cd PJWD

Run an ls -l command and you should see something like this (for illustration purposes only):

            ~/PJWD$ ls -l
            total 16
            drwxrwxr-x  2 ... ... 4096 Jun  1 19:15 docs_phase3
            drwxrwxr-x  5 ... ... 4096 Jun  1 19:14 FamilyShoppingList-client
            drwxrwxr-x 12 ... ... 4096 Jun  1 19:15 FamilyShoppingList-server
            -rw-rw-r--  1 ... ... 3514 Jun  1 19:15 README.md

Change directory to FamilyShoppingList-client and install:

    cd FamilyShoppingList-client/

Install the client with npm install:

    npm install

Start the app using ng serve at port 8089:

    ng serve --port 8089

Start the server by changing to the directory and starting it:

    cd FamilyShoppingList-server/

Use the startup script:

    ./startup.sh

Note that the server uses CORS and the allowed list is limited to 'http://localhost:8089', which needs to be changed as needed in the server.js file.

4. Seeding the database with test data

Use sequelize to run all seeds contained in this script in directory FamilyShoppingList-server:

    ./seed.sh






