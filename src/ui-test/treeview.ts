import { ActivityBar, after, CustomTreeSection, SideBarView, ViewContent, ViewControl, ViewTitlePart, Workbench, TreeItem, ContextMenu, InputBox, TitleActionButton, EditorView, NotificationType, TextEditor } from 'vscode-extension-tester';
import { expect } from 'chai';
import * as fs from 'fs';
import { createConfigFile, getDefaultConfigFilePath } from '../config_file/utils';
import * as path from 'path';
import { homedir } from 'os';
import * as clipboard from 'clipboardy';
import * as osc from 'outscale-api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson = require('../../package.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const commandTitle = require('../../package.nls.json');
const resourceTypes = [
    "Access Keys",
    "Api Access Rules",
    "Cas",
    "Client Gateways",
    "Dhcp Options",
    "DirectLinks",
    "DirectLink Interfaces",
    "Flexible Gpus",
    "Images",
    "Internet Services",
    "Volumes",
    "Keypairs",
    "LoadBalancers",
    "Nat Services",
    "Nets",
    "Net AccessPoints",
    "Net Peerings",
    "Nics",
    "External IPs",
    "Route tables",
    "Security Groups",
    "Snapshots",
    "Subnets",
    "Virtual Gateways",
    "Vms",
    "Vpn Connections",
    "Vm Groups",
    "Vm Templates"
];
const profile: any = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "first_profile": {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "access_key": "access_key",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "secret_key": "secret_key",
        "region": "eu-west-2"
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "second_profile": {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "access_key": "access_key",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "secret_key": "secret_key",
        "host": "outscale.com",
        "https": true,
        "method": "POST",
        "region": "eu-west-2"
    }
};
const settingPath = path.join("test-resources", "settings", "User", "settings.json");


function getButtonTitle(action: string): string {
    return commandTitle[action];
}

// in this test we will look at tree views in the left side bar
describe('ActivityBar', () => {
    let titlePart: ViewTitlePart;
    let view: ViewControl;
    let content: ViewContent;

    before(async () => {
        // make sure the view is open
        const expectedTitle = pjson["contributes"]["viewsContainers"]["activitybar"][0]["title"];
        const tempView = await new ActivityBar().getViewControl(expectedTitle);

        expect(tempView).not.undefined;
        if (typeof tempView === 'undefined') {
            return;
        }
        view = tempView;
        await view.openView();


        // now to initialize the view
        // this object is basically just a container for two parts: title & content
        const sideBarView = new SideBarView();
        titlePart = sideBarView.getTitlePart();
        content = sideBarView.getContent();
    });

    it('has good title', async () => {
        // title part usually only contains the title of the view
        // but it can also have action buttons
        const expectedTitle = `${pjson["contributes"]["viewsContainers"]["activitybar"][0]["title"]}: ${pjson["contributes"]["views"]["package-explorer"][0]["name"]}`.toUpperCase();
        const title = await titlePart.getTitle();
        expect(title).equals(expectedTitle);
    });

    describe("Add button", async () => {
        let action: TitleActionButton;

        before(async () => {
            const expectedCommandName = getButtonTitle("profile.addEntry");
            action = await titlePart.getAction(expectedCommandName);
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it.skip('open dialog', async function() {
            await action.click();
            const input = new InputBox();
            // Check the title
            const title = await input.getTitle();
            expect(title).equals("Add a profile (1/6)");

            // Check the first action to choose a unique name
            let message = await input.getMessage();
            expect(message?.startsWith("Choose a unique name for the profile")).true;
            await input.setText("vscode");
            await input.confirm();

            // Get the next one AK
            message = await input.getMessage();
            expect(message?.startsWith("Enter your Access Key")).true;
            await input.setText("AK");
            await input.confirm();

            // Get the next one SK
            message = await input.getMessage();
            expect(message?.startsWith("Enter your Secret Key")).true;
            await input.setText("SK");
            await input.confirm();

            // Get the next one region
            message = await input.getMessage();
            expect(message?.startsWith("Pick a region")).true;
            expect(await input.getText()).equals("eu-west-2");
            await input.confirm();

            // Get the next one host
            message = await input.getMessage();
            expect(message?.startsWith("Enter the host")).true;
            expect(await input.getText()).equals("outscale.com");
            await input.confirm();

            // Get the next one https
            const quickPick = await input.getQuickPicks();
            expect(quickPick.length).equals(2);
            expect(await quickPick[0].getText()).equals("yes");
            expect(await quickPick[1].getText()).equals("no");
            await input.selectQuickPick('yes');

            await delay(1000);

            const notifications = await new Workbench().getNotifications();
            expect(notifications.length).greaterThan(0);
            const notification = notifications[0];

            message = await notification.getMessage();
            expect(message).equals("The account 'vscode' is invalid. Please retry !");
            expect(await notification.getType()).equals(NotificationType.Error);
        });
    });

    it('has refresh button', async () => {
        const expectedCommandName = getButtonTitle("profile.refreshEntry");
        const action = await titlePart.getAction(expectedCommandName);
        expect(action).not.undefined;
    });

    describe('Open config button', async () => {
        let action: TitleActionButton;
        before(async () => {
            const expectedCommandName = getButtonTitle("profile.configure");
            action = await titlePart.getAction(expectedCommandName);
        });

        after(async () => {
            if (fs.existsSync(path.join(homedir(), ".osc", "config.json"))) {
                fs.rmSync(path.join(homedir(), ".osc", "config.json"));
            }
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it.skip('open the profile', async () => {
            await action.click();
            const editorView = new EditorView();
            const titles = await editorView.getOpenEditorTitles();
            expect(titles.includes('config.json')).true;
            await editorView.closeEditor('config.json');
        });
    });

    describe('Open settings button', () => {
        let action: TitleActionButton;
        before(async () => {
            const expectedCommandName = getButtonTitle("osc.openParameter");
            action = await titlePart.getAction(expectedCommandName);
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it.skip('open the settings', async () => {
            await action.click();
            const editorView = new EditorView();
            const titles = await editorView.getOpenEditorTitles();
            expect(titles.includes('Settings')).true;
            await editorView.closeEditor('Settings');
        });
    });

    describe('Content', async () => {
        let section: CustomTreeSection;
        before(async () => {
            const sectionTitle = pjson["contributes"]["views"]["package-explorer"][0]["name"];
            section = (await content.getSection(sectionTitle)) as CustomTreeSection;

        });

        it('has Welcome View', async () => {
            const welcomeContent = await section.findWelcomeContent();
            expect(welcomeContent).not.undefined;
        });

        it.skip('Has no profile', async () => {
            const visibleItem = await section.getVisibleItems();
            expect(visibleItem.length).equals(0, "Should no have any profile");
        });

        describe('Test with old configuration file path', async () => {
            const OLD_FILE_PATH = path.join(homedir(), ".osc_sdk", "config.json");
            before(async () => {
                fs.mkdirSync(path.dirname(OLD_FILE_PATH), { recursive: true });
                fs.writeFileSync(OLD_FILE_PATH, JSON.stringify(profile));
                await (new Workbench()).executeCommand("osc-viewer: Refresh");
            });

            after(async () => {
                if (fs.existsSync(OLD_FILE_PATH)) {
                    fs.rmSync(OLD_FILE_PATH);
                }
                await (new Workbench()).executeCommand("osc-viewer: Refresh");
            });

            it('Check number of profile', async () => {
                let visibleItem = await section.findItem("first_profile");
                expect(visibleItem).not.undefined;
                visibleItem = await section.findItem("second_profile");
                expect(visibleItem).not.undefined;
            });

        });

        describe('Test with new configuration file path', async () => {
            let firstProfile: TreeItem;
            before(async () => {
                createConfigFile();
                fs.writeFileSync(getDefaultConfigFilePath(), JSON.stringify(profile));
                await (new Workbench()).executeCommand("osc-viewer: Refresh");
            });

            after(async () => {
                if (fs.existsSync(getDefaultConfigFilePath())) {
                    fs.rmSync(getDefaultConfigFilePath());
                }
                await (new Workbench()).executeCommand("osc-viewer: Refresh");
            });

            it('Check number of profile', async () => {
                let visibleItem = await section.findItem("first_profile");
                expect(visibleItem).not.undefined;
                if (typeof visibleItem === 'undefined') {
                    return;
                }
                firstProfile = visibleItem;
                visibleItem = await section.findItem("second_profile");
                expect(visibleItem).not.undefined;
            });

            describe("Context Menu", async () => {
                let menu: ContextMenu;

                before(async () => {
                    menu = await firstProfile.openContextMenu();
                });

                after(async () => {
                    await menu.close();
                });

                it('has copy Account Id button', async () => {
                    const expectedCommandName = getButtonTitle("osc.copyAccountId");
                    expect(await menu.hasItem(expectedCommandName)).equals(true);
                });

                it('has show Account Info button', async () => {
                    const expectedCommandName = getButtonTitle("osc.showAccountInfo");
                    expect(await menu.hasItem(expectedCommandName)).equals(true);
                });
            });

            describe("Expand Default Profile", () => {
                let children: TreeItem[];
                before(async () => {
                    await firstProfile.expand();
                    children = await firstProfile.getChildren();
                });

                after(async () => {
                    await firstProfile.collapse();
                });


                it("Check all resources are present", async () => {
                    expect(children.length).equals(resourceTypes.length);
                    for (const el of children) {
                        expect(resourceTypes.includes(await el.getLabel()));
                    }
                });

                describe("Hide button", async () => {
                    let expectedCommandName: any;

                    before(async () => {
                        expectedCommandName = getButtonTitle("osc.disableResourceFolder");
                    });

                    after(async () => {
                        // Reset the option for disable folders
                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        delete setting['osc-viewer.disableFolders'];
                        fs.writeFileSync(settingPath, JSON.stringify(setting));
                        // Refresh to get up to date
                        await (new Workbench()).executeCommand("osc-viewer: Refresh");
                        children = await firstProfile.getChildren();
                    });

                    it.skip("exists", async () => {
                        for (const el of children) {
                            const action = await el.getActionButton(expectedCommandName);
                            expect(action).not.undefined;
                        }
                    });

                    it.skip("hides the folder", async () => {
                        const el = children[0];
                        const elLabel = await el.getLabel();
                        const action = await el.getActionButton(expectedCommandName);
                        await action?.click();

                        const hideChildren = await firstProfile.getChildren();
                        expect(hideChildren.length).equals(children.length - 1);

                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        expect(setting['osc-viewer.disableFolders'].length).equals(1);
                        expect(setting['osc-viewer.disableFolders'][0]).equals(elLabel);
                    });
                });

                describe("Filters button", async () => {
                    const expectedCommandName = getButtonTitle("osc.editFilters");

                    after(async () => {
                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        delete setting['osc-viewer.filters'];
                        fs.writeFileSync(settingPath, JSON.stringify(setting));
                        await (new Workbench()).executeCommand("osc-viewer: Refresh");
                    });

                    it.skip("exists", async () => {
                        for (const el of children) {
                            const action = await el.getActionButton(expectedCommandName);
                            // Images is not filtered right now
                            if ((await el.getLabel()) !== "Images") {
                                expect(action).not.undefined;
                            } else {
                                expect(action).undefined;
                            }
                        }
                    });

                    it.skip("add a filters to the resource", async () => {
                        const el = children[0];
                        const elLabel = await el.getLabel();
                        // Click on the button
                        const action = await el.getActionButton(expectedCommandName);
                        await action?.click();

                        // Check that a dialog open
                        const input = new InputBox();
                        const title = await input.getTitle();
                        expect(title).equals(`Edit Filters of ${elLabel} (1/2)`);

                        const quickPicks = await input.getQuickPicks();
                        expect(quickPicks.length).greaterThan(0);

                        const pick = quickPicks[0];
                        const pickLabel = await pick.getLabel();
                        await input.selectQuickPick(0);

                        // Get next one value
                        const message = await input.getMessage();
                        expect(message.startsWith("Enter Filter Value")).true;
                        await input.setText("{}");
                        await input.confirm();

                        await delay(1000);
                        // Check that thet filters is now in the settings
                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        const value = setting['osc-viewer.filters'];
                        expect(value).not.undefined;
                        const resourceFilters = value[elLabel];
                        expect(resourceFilters).not.undefined;
                        expect(Object.keys(resourceFilters[pickLabel]).length).equals(0, "The filters value shoudl be '{}'");
                    });



                });

                describe("Reset filters button", async () => {
                    const expectedCommandName = getButtonTitle("osc.resetFilters");
                    let firstResource: string;

                    before(async () => {
                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        firstResource = await children[0].getLabel();
                        setting['osc-viewer.filters'] = {};
                        setting['osc-viewer.filters'][firstResource] = {
                            'check': {}
                        };
                        fs.writeFileSync(settingPath, JSON.stringify(setting));
                        await (new Workbench()).executeCommand("osc-viewer: Refresh");
                    });

                    after(async () => {
                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());
                        delete setting['osc-viewer.filters'];
                        fs.writeFileSync(settingPath, JSON.stringify(setting));
                        await (new Workbench()).executeCommand("osc-viewer: Refresh");
                    });

                    it.skip("exists", async () => {
                        const action = await children[0].getActionButton(expectedCommandName);
                        expect(action).not.undefined;
                    });

                    it.skip("delete the filters", async () => {
                        const action = await children[0].getActionButton(expectedCommandName);
                        await action?.click();

                        await delay(1000);

                        const rawData = fs.readFileSync(settingPath);
                        const setting = JSON.parse(rawData.toString());

                        const filters = setting['osc-viewer.filters'][firstResource];
                        expect(filters).undefined;
                    });

                });

                describe("Access Keys (good mock)", async () => {
                    let resource: TreeItem;
                    let resourceChildren: TreeItem[];

                    before(async () => {
                        resource = children[0];
                        expect(await resource.getLabel()).equals("Access Keys");
                        await resource.expand();
                        resourceChildren = await resource.getChildren();
                    });

                    after(async () => {
                        await resource.collapse();
                        await (new EditorView()).closeAllEditors();
                    });

                    it("has two values", async () => {
                        expect(resourceChildren.length).equals(2);
                    });

                    it("shows resource detail when clicking", async () => {
                        await resourceChildren[0].click();

                        await delay(500);

                        // New titles in editor
                        const editor = new TextEditor();
                        expect(await editor.getTitle()).equals("AK.json");
                        const data = await editor.getText();
                        const accessKey = osc.AccessKeyFromJSON(JSON.parse(data));
                        expect(accessKey.accessKeyId).equals("AK");
                        expect(accessKey.state).equals("ACTIVE");

                        const editorView = new EditorView();
                        await editorView.closeEditor("AK.json");
                    });

                    it.skip("refresh the state", async () => {
                        await resourceChildren[0].click();
                        await delay(500);

                        const editor = new TextEditor();
                        let data = await editor.getText();
                        const accessKey = osc.AccessKeyFromJSON(JSON.parse(data));

                        const editorView = new EditorView();
                        const expectedCommandName = getButtonTitle("osc.refreshResourceData");
                        const refreshButton = await editorView.getAction(expectedCommandName);
                        expect(refreshButton).not.undefined;

                        await refreshButton?.click();

                        data = await editor.getText();
                        const accessKey2 = osc.AccessKeyFromJSON(JSON.parse(data));

                        expect(accessKey.lastModificationDate).not.equals(accessKey2.lastModificationDate);
                        await editorView.closeEditor("AK");
                    });

                    describe("Context menu", () => {
                        let contextMenu: ContextMenu;

                        describe("Copy Resource Id button", () => {
                            const expectedCommandName = getButtonTitle("osc.copyResourceId");

                            before(async () => {
                                contextMenu = await resourceChildren[0].openContextMenu();
                            });

                            after(async () => {
                                await contextMenu.close();
                            });

                            it("exists", async () => {
                                expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                            });

                            it("copies the resource id into clipboard", async () => {
                                const action = await contextMenu.getItem(expectedCommandName);
                                await action?.select();

                                expect(clipboard.readSync()).equals("AK");

                            });
                        });

                        describe("Delete button", async () => {
                            const expectedCommandName = getButtonTitle("osc.deleteResource");

                            before(async () => {
                                contextMenu = await resourceChildren[0].openContextMenu();
                            });

                            after(async () => {
                                await contextMenu.close();
                                children = await firstProfile.getChildren();
                            });

                            it("exists", async () => {
                                expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                            });

                            it("deletes the resource", async () => {
                                const action = await contextMenu.getItem(expectedCommandName);
                                await action?.select();

                                // Got notification to confirm deletion
                                const notifications = await new Workbench().getNotifications();
                                const notification = notifications[0];
                                const message = await notification.getMessage();
                                expect(message).equals("Do you want to delete the resource AK ?");
                                const buttons = await notification.getActions();
                                expect(buttons.length).equals(2);

                                // Confirm the action
                                await notification.takeAction("Yes");

                                // Refresh because no yet implemented
                                await (new Workbench()).executeCommand("osc-viewer: Refresh");

                                // Check that the resource is now deleted
                                const resulting = await resource.getChildren();
                                expect(resulting.length).equals(1);
                                expect(await resulting[0].getLabel()).equals("AK2");
                            });

                        });
                    });
                });

                describe("Api Access Rules (error handling)", async () => {
                    let resource: TreeItem;

                    before(async () => {
                        resource = children[1];
                        expect(await resource.getLabel()).equals("Api Access Rules");
                    });

                    after(async () => {
                        await resource.collapse();
                        await (new EditorView()).closeAllEditors();
                    });

                    afterEach(async () => {
                        await resource.collapse();
                        await (new Workbench()).executeCommand("osc-viewer: Refresh");
                    });

                    it("Listing error", async () => {
                        await resource.expand();

                        // Got notification to confirm deletion
                        const notifications = await new Workbench().getNotifications();
                        expect(notifications.length).equals(1);
                        const notification = notifications[0];
                        const message = await notification.getMessage();
                        expect(message).equals("Error while reading Api Access Rules: 403 Error");
                        const type = await notification.getType();
                        expect(type).equals(NotificationType.Error);
                    });

                    it("Listing empty", async () => {
                        await resource.expand();
                        expect(((await resource.getChildren()).length)).equals(0);
                    });

                    describe("Delete error", async () => {
                        const expectedCommandName = getButtonTitle("osc.deleteResource");
                        let resourceChildren: TreeItem[];
                        let contextMenu: ContextMenu;

                        before(async () => {
                            await resource.expand();
                            resourceChildren = await resource.getChildren();
                            expect(resourceChildren.length).greaterThan(0);
                            contextMenu = await resourceChildren[0].openContextMenu();
                        });

                        after(async () => {
                            await contextMenu.close();
                        });

                        it("occurs", async () => {
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            let notifications = await new Workbench().getNotifications();
                            let notification = notifications[0];
                            let message = await notification.getMessage();
                            expect(message).equals("Do you want to delete the resource api1 ?");
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            notifications = await new Workbench().getNotifications();
                            notification = notifications[0];
                            message = await notification.getMessage();
                            expect(message).equals("Error while deleting the resource api1: 403 Error");
                        });
                    });
                });

                describe("Special Case: VMs", async () => {
                    let resource: TreeItem;
                    let resourceChildren: TreeItem[];

                    before(async () => {
                        for (const item of children) {
                            const label = await item.getLabel();
                            if (label === "Vms") {
                                resource = item;
                                break;
                            }
                        }
                        expect(await resource.getLabel()).equals("Vms");
                        await resource.expand();
                        resourceChildren = await resource.getChildren();
                    });

                    after(async () => {
                        await resource.collapse();
                    });

                    describe("Start button", async () => {
                        const expectedCommandName = getButtonTitle("osc.startVm");
                        let contextMenu: ContextMenu;

                        before(async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                        });

                        after(async () => {
                            await contextMenu.close();
                            await (new EditorView()).closeAllEditors();
                        });

                        it("exists", async () => {
                            expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                        });

                        it("starts the vm", async () => {
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to start the resource vm1 ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            await resourceChildren[0].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const vm = osc.VmFromJSON(JSON.parse(data));
                            expect(vm.state).equals("running");
                        });

                    });

                    describe("Stop button", async () => {
                        const expectedCommandName = getButtonTitle("osc.stopVm");
                        let contextMenu: ContextMenu;

                        before(async () => {
                            contextMenu = await resourceChildren[1].openContextMenu();
                        });

                        after(async () => {
                            await contextMenu.close();
                            await (new EditorView()).closeAllEditors();
                        });

                        it("exists", async () => {
                            expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                        });

                        it("stop the vm", async () => {
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to stop the resource vm2 ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            await resourceChildren[1].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const vm = osc.VmFromJSON(JSON.parse(data));
                            expect(vm.state).equals("stopped");
                        });

                    });

                    describe("Filter Vms", async () => {
                        before(async () => {
                            // Reset the option for disable folders
                            const rawData = fs.readFileSync(settingPath);
                            const setting = JSON.parse(rawData.toString());
                            setting['osc-viewer.filters'] = {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                "Vms": {
                                    // eslint-disable-next-line @typescript-eslint/naming-convention
                                    "TagKeys": ["Filtered"]
                                }
                            };
                            fs.writeFileSync(settingPath, JSON.stringify(setting));
                            // Refresh to get up to date
                            await (new Workbench()).executeCommand("osc-viewer: Refresh");
                        });

                        after(async () => {
                            // Reset the option for disable folders
                            const rawData = fs.readFileSync(settingPath);
                            const setting = JSON.parse(rawData.toString());
                            setting['osc-viewer.filters'] = [];
                            fs.writeFileSync(settingPath, JSON.stringify(setting));
                            // Refresh to get up to date
                            await (new Workbench()).executeCommand("osc-viewer: Refresh");
                        });

                        it("has only one VM", async () => {
                            const filteredChildren = await resource.getChildren();
                            expect(filteredChildren.length).equals(1);
                            expect(await filteredChildren[0].getLabel()).equals("vmId2");
                        });

                    });

                    describe("Show Console Logs", async () => {
                        const expectedCommandName = getButtonTitle("osc.showConsoleLogs");
                        let contextMenu: ContextMenu;

                        before(async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                        });

                        after(async () => {
                            await contextMenu.close();
                            await (new EditorView()).closeAllEditors();
                        });

                        it("exists", async () => {
                            expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                        });

                        it("shows logs of the Vms", async () => {
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            const editor = new TextEditor();
                            const data = await editor.getText();
                            expect(data).equals("Hello World");
                        });
                    });

                });

                describe("Link Resouce", async () => {
                    let resource: TreeItem;
                    let resourceChildren: TreeItem[];

                    before(async () => {
                        for (const item of children) {
                            const label = await item.getLabel();
                            if (label === "Route tables") {
                                resource = item;
                                break;
                            }
                        }
                        expect(await resource.getLabel()).equals("Route tables");
                        await resource.expand();
                        resourceChildren = await resource.getChildren();
                        expect(resourceChildren.length).equals(2);
                    });

                    after(async () => {
                        await resource.collapse();
                    });

                    describe("Unlink button", async () => {
                        const expectedCommandName = getButtonTitle("osc.unlinkResource");
                        let contextMenu: ContextMenu;

                        afterEach(async () => {
                            await contextMenu.close();
                            await (new EditorView()).closeAllEditors();
                        });

                        it("exists", async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                            expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                        });

                        it("unlink with multiple choices", async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to unlink the resource rtb1 ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            // Get the dialog to choose between two rt association
                            const input = new InputBox();

                            // Select rtbassoc
                            const quickPick = await input.getQuickPicks();
                            expect(quickPick.length).equals(2);
                            expect(await quickPick[0].getText()).equals("rtbassoc1");
                            expect(await quickPick[1].getText()).equals("rtbassoc2");
                            await input.selectQuickPick('rtbassoc1');

                            await resourceChildren[0].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const rt = osc.RouteTableFromJSON(JSON.parse(data));
                            expect(rt.linkRouteTables?.length).equals(1);
                        });

                        it("unlink with one choice", async () => {
                            contextMenu = await resourceChildren[1].openContextMenu();
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to unlink the resource rtb2 ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            await resourceChildren[1].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const rt = osc.RouteTableFromJSON(JSON.parse(data));
                            expect(rt.linkRouteTables?.length).equals(0);
                        });

                    });

                });

                describe("Subresource Resouce", async () => {
                    let resource: TreeItem;
                    let resourceChildren: TreeItem[];

                    before(async () => {
                        for (const item of children) {
                            const label = await item.getLabel();
                            if (label === "Security Groups") {
                                resource = item;
                                break;
                            }
                        }
                        expect(await resource.getLabel()).equals("Security Groups");
                        await resource.expand();
                        resourceChildren = await resource.getChildren();
                        expect(resourceChildren.length).equals(2);
                    });

                    after(async () => {
                        await resource.collapse();
                    });

                    describe("Delete button", async () => {
                        const expectedCommandName = getButtonTitle("osc.deleteSubresource");
                        let contextMenu: ContextMenu;

                        afterEach(async () => {
                            await contextMenu.close();
                            await (new EditorView()).closeAllEditors();
                        });

                        it("exists", async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                            expect(await contextMenu.hasItem(expectedCommandName)).equals(true);
                        });

                        it("delete with multiple choices", async () => {
                            contextMenu = await resourceChildren[0].openContextMenu();
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to remove the subresource of first-sg ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");

                            // Get the dialog to choose between Inbound or Outbound
                            let input = new InputBox();

                            // Select Inbound
                            let quickPick = await input.getQuickPicks();
                            expect(quickPick.length).equals(2);
                            expect(await quickPick[0].getText()).equals("Inbound");
                            expect(await quickPick[1].getText()).equals("Outbound");
                            await input.selectQuickPick('Inbound');

                            input = new InputBox();
                            quickPick = await input.getQuickPicks();
                            expect(quickPick.length).equals(2);
                            expect(await quickPick[0].getText()).equals("From 0.0.0.0/0:[-1 -> -1] via -1");
                            expect(await quickPick[1].getText()).equals("From sg-12345:[22 -> 23] via tcp");
                            await input.selectQuickPick(1);

                            await resourceChildren[0].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const sg = osc.SecurityGroupFromJSON(JSON.parse(data));
                            expect(sg.inboundRules?.length).equals(1);
                        });

                        it("delete with one choice", async () => {
                            contextMenu = await resourceChildren[1].openContextMenu();
                            const action = await contextMenu.getItem(expectedCommandName);
                            await action?.select();

                            // Got notification to confirm deletion
                            const notifications = await new Workbench().getNotifications();
                            const notification = notifications[0];
                            const message = await notification.getMessage();
                            expect(message).equals("Do you want to remove the subresource of second-sg ?");
                            const type = await notification.getType();
                            expect(type).equals(NotificationType.Warning);
                            const buttons = await notification.getActions();
                            expect(buttons.length).equals(2);

                            // Confirm the action
                            await notification.takeAction("Yes");
                            await resourceChildren[1].select();
                            await delay(500);
                            const editor = new TextEditor();
                            const data = await editor.getText();
                            const sg = osc.SecurityGroupFromJSON(JSON.parse(data));
                            expect(sg.outboundRules?.length).equals(0);
                        });
                    });
                });
            });
        });
    });
});
function delay(milliseconds: number): Promise<number> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}