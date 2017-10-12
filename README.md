# Neuro-Share

## Project Setup

For setting up your working environment the following tools, libs and frameworks are required:
* NVM
* Node.js v6.9.2 
* NPM
* Git
* Angular-cli
* Git-up (nice to have)

### Install NVM
```
$ sudo apt-get update
$ sudo apt-get install build-essential libssl-dev
$ curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh -o install_nvm.sh
```

### Install node and npm
```
$ nvm install v6.9.2

## Install git
```
$ apt-get install git
```

## Install Angular-cli
Remove the old package if installed
```
$ npm uninstall -g angular-cli @angular/cli
```
```
$ npm install -g @angular/cli@latest
```

## Install Git up
https://github.com/aanand/git-up

You need to install ruby and ruby gems 
```
sudo apt-get install ruby
sudo apt-get install ruby-dev
sudo apt-get install rubygems-integration
sudo gem install git-up 
```

## Create a project folder
Create a git folder for all your repos work:
```
mkdir git
cd git 
```

## Git clone repository
```
git clone https://github.com/SutterRDD/neuro-share-app.git
```

## Install dependencies
_cd_ into app folder and install dependencies
```
npm install
```

## Start the server
Run a ng task to create a local, Node-based http server on localhost:4200 (or 127.0.0.1:4200 for some configurations) by typing:
```
ng serve
```
You can configure the default HTTP port and the one used by the LiveReload server with two command-line options
```
ng serve --host 0.0.0.0 --port 4201 --live-reload-port 49153
```

## Create a build
```
ng build
```

## Stop the server
If you ever need to stop the server, use the Ctrl+C keyboard command to quit your current CLI process.

## Run unit tests
Tests will execute after a build is executed via Karma, and it will automatically watch your files for changes. It can be run as follows:
```
ng test
```

## Running end-to-end tests
Before running the tests make sure you are serving the app via ng serve. End-to-end tests are run via Protractor.
```
ng e2e
```

## Linting code
This will use the lint npm script that in generated projects uses tslint. You can lint your app code by running:
```
ng lint
```