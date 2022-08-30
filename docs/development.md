# Developement Process

## Pre-requisite
 - node (v16.3.0): See [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to install node
 - npm (v7.15.1): Comes with node


## Install dev dependencies
```shell
npm install
```

## Build
```
npm run-script package
```

## Execute local version
 1. The best way to test local version is to open project folder in vscode and press `F5` to execute a specific task that will open a development vcode windows. With this approach, any modification in the code can be retrieved in the dev windows by just reloading it (`Reload Windows`)

 2. Another approach is to package the project and install it


Before doing any modification, it is best to increase the version number before starting development window. Indeed, if the plugin is already installed, vscode struggles to upgrade it.

## Test
The project does not have right now tests


## Release
The release is done by a Github Action, to activate the GH action you just need to push a tag. Here are some rules:
- Before any release, increase the version number and commit all changes after doing ```npm install```
- Update [README](./../README.md) and [CHANGELOG](../CHANGELOG.md)
- Tag the version using semantic convention (vX.Y.Z)
- Push to the repo
