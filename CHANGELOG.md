# Change Log

## [v0.11.0]
### Changes
  - Update Outscale to 0.19

## [v0.10.1]
### Bugfixes 
  - Fix Refresh button
### Changes
  - Update Outscale to 0.17

## [v0.10.0]
### Features 
  - Show LoadBalancer Health on UI and on hover

### Changes
  - Modify the behavior of dialog view, does not disappear when focusing out

### Bugfixes 
  - Fix plugin after 1.90.0 vscode

## [v0.9.0]
### Features 
  - Install the latest version available of osc-cost
  - Rework security group removals (multiple selection)

## [v0.8.1]
### Bugfixes 
  - Fix Profile name in osc-cost calls

## [v0.8.0]
### Features
  - Display tags when hovering over resources
  - Support cost estimation using osc-cost
  - Add Dedicated Group resource
### Bugfixes 
  - Fix network view after API 1.29.3
  - Fix Account display
## [v0.7.0]
### Features
  - Add resources links in resource descriptions
  - Add VmGroup and VmTemplate resources
### Changes 
  - Change virtual resources description filename to add autodetection of file language (add .json)
## [v0.6.1]
### Bugfixes
  - Add Virtual Private Gateway to the Net visualization graph 
## [v0.6.0]
### Features
  - (Beta) Display Net view (see README)
  - Add the ability to retrieve of Administator password for Windows instances
  - Add the ability to teardown Nets
  - Translate the plugin into French (more is coming)
## [v0.5.0]
### Features
  - Add the ability to unlink resources such as RouteTable, Internet Services
  - Add the ability to copy AK/SK directly from the UI
  - Add the ability to remove subresources such as Security Group rules for Security Groups
  - Sort the list of resources
## [v0.4.0]
### Features
  - Add resources (Access Key, Api Access Rule, Ca, Client Gateway, DHCP Options, DirectLink, DirectLink Interface, Flexible GPU, Internet Service, Nat Service, Net Acess Peering, Nic, Snapshots, RouteTable, Subnet, VpnConnection)
  - Add the ability to hide some resources from the view
  - Add the ability to filter some resources
  - Add WelcomeView for first installation
  - Add Open Settings button
### Changes
  - Error messages are now clearer
  - Read Console default interval is now set to 30s and randomness is added to avoid throttling
## [v0.3.4]
### Bugfixes
  - Check type of interval for automatic reload
## [v0.3.3]
### Bugfixes
  - Fix path resolution on Windows (#26)
## [v0.3.2]
### Bugfixes
 - Fix retrieval of VM console logs
 - Fix read of old path configuration file 
## [v0.3.1]
### Features
 - Implement `Delete` action for all resources
 - Add User-Agent
 - Add Logging of requests

## [v0.3.0]
### Features
 - Add new resources (PublicIp, OMI, Snapshots, Routetables)
 - Support dynamic icon for PublicIps and Volumes
 - Add actions on accounts (show account info and copy AccountId)
 - Support manual content refresh on resources

## [v0.2.1]
### Bugfixes
- Fix profile default values
## [v0.2.0]
### Features
 - Add Console logs (manual and automatic reload)
 - Add confirmation step when starting/stopping and deleting resources

## [v0.1.0]
### Features
 - Add steps in profile creation for protocol and host

### Bugfixes
 - When focusing out from the profile creation menu, it will not disappear
## [v0.0.4]
- Support https and hosts field in config file
## [v0.0.3]
- Handle `region` and `region_name` in config file

## [v0.0.2]
- Add new resources: Loadbalancers and Volumes
- Add copy resource id to clipboard
- Fix update of raw data
## [v0.0.1]
- Add account into the `config.json`
- Listing of this resources for all accounts
  - VMs
  - Nets
  - Security Groups
  - Keypairs
- Start, Stop and Deletion of Vms (right click)
- Display raw cloud resource when clicking on it 
- Display icon state according to the status