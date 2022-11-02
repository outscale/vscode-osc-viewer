# Change Log

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