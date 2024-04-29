The Family Shopping List web-app’s goal is to improve the planning and shopping of grocery items in real brick-and-mortar stores. Families can plan ahead and add to a shared shopping list to communicate in a collaborative way what items are needed. Family members can create, modify, and remove items of a store’s inventory, for example, if certain products are no longer desired or available. All participating families share the same inventory data and can exchange ideas on a family-to-family bases.

While in the store shopping for the items from the shopping list, family members can still add more items to the list. The app keeps everyone up-to-date in almost real-time with a delay of 5 to 10 seconds. Once in shopping mode, family member can check off items from the list, which means that these items are now in the shopping cart. After checking out at the register, the shopping list can be closed.

A mobile-first and responsive web design guided the development of the entire app. Hosting the web-app with a web server, for example, Apache Tomcat, was easily accomplished.

Installation for Ubuntu 22

1. Install npm and Node.js

Update the linux environment and install npm

    sudo apt update
    
    sudo apt upgrade
     
    sudo apt install npm
     
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
