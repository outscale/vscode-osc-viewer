# 3DS Outscale Viewer
This extension provides a vscode integrated viewer of cloud resources. It relies on widely use configuration file (~/.osc/config.json or ~/.osc_sdk/config.json).

## Installation
Open this extension in the  [Visual Studio Marketplace]https://marketplace.visualstudio.com/items?itemName=outscale.osc-viewer

## What is it available ?
- Add account into the `config.json`
- Listing of this resources for all accounts
  - VMs
  - Nets
  - Security Groups
  - Keypairs
  - Load balancers
  - Volumes
  - Public Ip
  - OMI
  - Snapshots
  - Route Tables
- Start, Stop and Deletion of Vms (right click)
- Display raw cloud resource when clicking on it and manual refresh
- Display icon state according to the status of Vms, Volumes and Public Ip
- Display account information
- Display console output

## What is next ?
- Network view
- Ask what you want :) 

## Development
See [Developpment process](./docs/development.md)

## License

> Copyright Outscale SAS
>
> BSD-3-Clause