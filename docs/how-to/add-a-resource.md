# How to add a resource ?

- [How to add a resource ?](#how-to-add-a-resource-)
  - [Minimum for a resource](#minimum-for-a-resource)
    - [Implement API calls for the resource](#implement-api-calls-for-the-resource)
    - [Add the resource type into the enum](#add-the-resource-type-into-the-enum)
    - [Implement the class to display the resource](#implement-the-class-to-display-the-resource)
    - [Load the created class at the startup](#load-the-created-class-at-the-startup)
    - [Configure the resource display class to handle the new resource](#configure-the-resource-display-class-to-handle-the-new-resource)
    - [Configure the link process to handle resource links](#configure-the-link-process-to-handle-resource-links)
  - [Add others existing actions](#add-others-existing-actions)
  - [Create a new action](#create-a-new-action)
    - [Creating oneshot actions (if not)](#creating-oneshot-actions-if-not)
    - [Creating factorized actions (if so)](#creating-factorized-actions-if-so)
    - [Register the action (both cases)](#register-the-action-both-cases)
      - [Define the command in `package.json`](#define-the-command-in-packagejson)
      - [Register the action at start up](#register-the-action-at-start-up)


## Minimum for a resource
Let's say you want to add a new Outscale resource to the plugin. Here are the steps to add a new resource. Here we want to add `VmTemplate`.

### Implement API calls for the resource
Add the functions to call the API using the SDK in `src/cloud/vmtemplate.ts`
    
In this file, you need to implement at least 3 functions:
  - Getter for all resource of this type
```javascript
export function getVmTemplates(profile: Profile, filters?: osc.FiltersVmTemplate): Promise<Array<osc.VmTemplate> | string>
```
 - Getter for a specific resource

```javascript
export function getVmTemplate(profile: Profile, resourceId: string): Promise<osc.VmTemplate | undefined | string> {
```
 - Deletion of the resource

```javascript
export function deleteVmTemplate(profile: Profile, resourceId: string): Promise<string | undefined> {
```

The implementation should be straightforward, take a look at one implemented resource to see the template of these functions.

### Add the resource type into the enum
Add the type of the resource in the variable `ResourceNodeType` in the file `src/flat/node.ts`. This type is how we deal with Generic in our code especially when we want to display resource description.

In our case, we will add `VmTemplate`, it is just a convention to remove spaces.
```javascript
export type ResourceNodeType =
    "AccessKey" |
    ... |
    "VmTemplate";
```

### Implement the class to display the resource
Create the resource to display the resource in the plugin

In this step, we will create a class that implements `ExplorerFolderNode` which will allow us to display the resource in the plugin. To do it, create the file `src/flat/folders/simple/node.folder.vmtemplate.ts`.

```javascript
export const VMTEMPLATES_FOLDER_NAME = "Vm Templates"; // 1. The display name of the resource

export class VmTemplatesFolderNode extends FiltersFolderNode<FiltersVmTemplate> implements ExplorerFolderNode {
    constructor(readonly profile: Profile) {
        super(profile, VMTEMPLATES_FOLDER_NAME);
    }

    getChildren(): Thenable<ExplorerNode[]> { // 2. Retrieval of all resources under the resources
        this.updateFilters();
        return getVmTemplates(this.profile, this.filters).then(results => {
            if (typeof results === "string") {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while reading {0}: {1}`, this.folderName, results));
                return Promise.resolve([]);
            }
            const resources = [];
            for (const item of results) {

                if (typeof item.vmTemplateId === 'undefined') {

                    continue;
                }

                if (typeof item.vmTemplateName === 'undefined') {

                    continue;
                }

                resources.push(new ResourceNode(this.profile, item.vmTemplateName, item.vmTemplateId, "VmTemplate", deleteVmTemplate, getVmTemplate));

            }
            return Promise.resolve(resources.sort(resourceNodeCompare));
        });

    }

    filtersFromJson(json: string): FiltersVmTemplate { // This function is used to filters the resources directly
        return FiltersVmTemplateFromJSON(json);
    }
}
```

`ResourceNode` is as generic class to display simple resource in the plugin. It takes:
- the profile object to make API calls
- the human name of the resource if it exist, otherwise just put `""`
- the id of the resource
- the type of the resource
- API delete function
- API get function 

### Load the created class at the startup

To do it, you need to add into the local variable `resources`in `src/flat/node.profile.ts`, the definition of our folder:
```javascript
const resources = [
    [ACCESSKEY_FOLDER_NAME, new AccessKeysFolderNode(this.profile)],
    ...
    [VMTEMPLATES_FOLDER_NAME, new VmTemplatesFolderNode(this.profile)],
];
```

The first element is the display name in the UI, the second element is how to instantiate the object.

### Configure the resource display class to handle the new resource
Helps the resources description viewer to display the resource

To do it, you need to add the serialization method of the resource in the variable  `resourceMap` in the file `src/virtual_filesystem/oscvirtualfs.ts`

In our example:
```javascript
const resourceMap = new Map([
    ["profile", new ResourceEncoding(getAccount, AccountToJSON)],
    ...
    ["VmTemplate", new ResourceEncoding(getVmTemplate, VmTemplateToJSON)],
]);
```

### Configure the link process to handle resource links

When you display the resource, you can link to the resource but the process needs to detect it. The detection is done by providing the regexp to recognize the ID our resource. You need to add it in `resourceToRegexp`in the file `src/virtual_filesystem/osclinkprovider.ts`

In our example, the ID of `VmTemplate` is `vmtemplate-<32 char of hexa>" therefore we add:
```javascript
const resourceToRegexp: Map<ResourceNodeType, [string, string]> = new Map([
    ["ApiAccessRule", ["aar-", "aar-[a-f0-9]{32}"]],
    ...
    ["VmTemplate", ["vmtemplate-", "vmtemplate-[a-f0-9]{32}"]];
```
The first  element is the type of our resource (defined in 2.), the second is composed of the prefix of the ID and the real regexp of the resource.

With 6 four little steps, you will have the resource in the UI and you will have automatically:
- Resources description
- Deletion
- ID copy
- Link in resource description
- Filters when listing resources

## Add others existing actions
The previous chapter should covers the average usage but sometimes we need to add more actions. For example:
 - Unlink resources (volume, routetable, etc)
 - Handle subresources (SecurityGroup, RouteTable)

If the resource supports one or more actions listed above, you will need to create two more files.

> Vm Template do not need new actions so the resource will now be RouteTable

1. Move `src/flat/folders/simple/node.folder.routetables.ts` into `src/flat/folders/specific/node.folder.routetables.ts`

Why do we need this ? To maintain a list of resources that have additional resources

2. Create a file `src/flat/resources/node.resources.routetables.ts`

All interfaces to the additional actions can be found in `src/flat/resources/types`

Route Table can unlink resource and have subresources therefore it must implement `LinkResourceNode` and `SubResourceNode`.

The file is now:

```javascript
export class RouteTableResourceNode extends ResourceNode implements LinkResourceNode, SubResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState: string) {
        super(profile, resourceName, resourceId, "routetables", deleteRouteTable, getRouteTable);
    }

    getContextValue(): string {
        return "routetableresourcenode;linkresourcenode;subresourcenode"; // This will be improved later but right now this is do enable button actions for the resource `liunkresourcenode` => `Unlink`,  `subresourcenode` => `Remove Subresource`
    }

    getIconPath(): vscode.ThemeIcon {
        switch (this.resourceState) {
            case "link":
                return new vscode.ThemeIcon("plug");
            default:
                return new vscode.ThemeIcon("dash");
        }

    }
    ...

}
```

And implements all mandatory methods.

## Create a new action

When creating a new action for a resource, you need to think whether or not the action will be used for another resource. 

### Creating oneshot actions (if not)
Add the method in the resource directly

### Creating factorized actions (if so)
> We will take `UnLink` action as an example

- Create the interface in  `src/flat/resources/types/node.resources.link.ts` (we could have named unlink, you're right)
```javascript
export interface LinkResourceNode extends ExplorerResourceNode {
    unlinkResource(): Promise<string | undefined>
    unlinkAllResource(): Promise<string | undefined>
}
```
You are free to call the method whatever you like as long as it describes the actions.

- Implements the action in the target resources ([see](#add-others-existing-actions))

### Register the action (both cases)
See [resources](https://code.visualstudio.com/api/extension-guides/tree-view#view-actions) for more info
#### Define the command in `package.json`
- Add the command in `commands`, you will need to specify the command name, the title, the category (always `osc-viewer`) and the icon (optional). In our example:
```json
{
    "command": "osc.unlinkResource",
    "title": "Unlink",
    "category": "osc-viewer"
},
```

- Specify when the action has to be shown by adding to `view/item/context`. In our example:
```json
{
    "command": "osc.unlinkResource",
    "when": "view == profile && viewItem =~ /linkresourcenode/",
    "group": "oscinteract@5"
},
```
> viewItem is related to the getContext method (cf [here](#add-others-existing-actions))

#### Register the action at start up
To register the action, you need to add the following code into `src/extension.ts`

```javascript
    vscode.commands.registerCommand('osc.unlinkResource', async (arg: LinkResourceNode) => {
        showYesOrNoWindow(vscode.l10n.t(`Do you want to unlink the resource {0} ?`, arg.getResourceName()), async () => {
            const res = await arg.unlinkResource();
            if (typeof res === "undefined") {
                vscode.window.showInformationMessage(vscode.l10n.t(`The resource {0} has been unlinked`, arg.getResourceName()));
            } else {
                vscode.window.showErrorMessage(vscode.l10n.t(`Error while unlinking the resource {0}: {1}`, arg.getResourceName(), res));
            }
        });
    });
```
