import { ActivityBar, after, CustomTreeSection, SideBarView, ViewContent, ViewControl, ViewTitlePart, Workbench, TreeItem, ContextMenu, InputBox, TitleActionButton, EditorView, NotificationType } from 'vscode-extension-tester';
import { expect } from 'chai';
import * as fs from 'fs';
import { createConfigFile, getDefaultConfigFilePath } from '../config_file/utils';
import * as path from 'path';
import { homedir } from 'os';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson = require('../../package.json');
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
    "Vpn Connections"
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
            const expectedCommandName = pjson["contributes"]["commands"].filter((x: any) => x["command"] === "profile.addEntry")[0];
            action = await titlePart.getAction(expectedCommandName["title"]);
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it('open dialog', async function () {
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
        const expectedCommandName = pjson["contributes"]["commands"].filter((x: any) => x["command"] === "profile.refreshEntry")[0];
        const action = await titlePart.getAction(expectedCommandName["title"]);
        expect(action).not.undefined;
    });

    describe('Open config button', async () => {
        let action: TitleActionButton;
        before(async () => {
            const expectedCommandName = pjson["contributes"]["commands"].filter((x: any) => x["command"] === "profile.configure")[0];
            action = await titlePart.getAction(expectedCommandName["title"]);
        });

        after(async () => {
            fs.rmSync(path.join(homedir(), ".osc", "config.json"));
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it('open the profile', async () => {
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
            const expectedCommandName = pjson["contributes"]["commands"].filter((x: any) => x["command"] === "osc.openParameter")[0];
            action = await titlePart.getAction(expectedCommandName["title"]);
        });

        it('exists', async () => {
            expect(action).not.undefined;
        });

        it('open the settings', async () => {
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

        it('Has no profile', async () => {
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
        });
    });
});
function delay(milliseconds: number): Promise<number> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}