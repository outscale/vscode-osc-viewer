# 3DS Outscale Viewer
[![Project Graduated](docs/Project-Graduated-green.png)](https://docs.outscale.com/en/userguide/Open-Source-Projects.html)

This extension provides a vscode integrated viewer of cloud resources. It relies on widely use configuration file (~/.osc/config.json or ~/.osc_sdk/config.json).

## Installation
Open this extension in the  [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=outscale.osc-viewer)
## What is available ?
### Add profile into configuration file
![Add Profile](./docs/resources/addProfile.gif)
### Hide resources from the view
![Hide resources](./docs/resources/hideResource.gif)
### Filter resources from the view
![Filter resources](./docs/resources/filterResource.gif)
### Show details of a resource 
![Show resources detail](./docs/resources/showResource.gif)
### Do actions on resources
![Action on resources](./docs/resources/deleteResource.gif)
### Show Console logs of VMs
![Console Logs](./docs/resources/consoleLogs.gif)
### (Beta) Show Net view
This feature uses the library [cytoscape](https://github.com/cytoscape/cytoscape.js) and the layout [dagre](https://github.com/cytoscape/cytoscape.js-dagre) to display the Net view. This is a beta feature, do not hesitate to test and give feedbacks.
![VPC View](./docs/resources/network-view.gif)

## Development
See [Development process](./docs/development.md)

## License

> Copyright Outscale SAS
>
> BSD-3-Clause
