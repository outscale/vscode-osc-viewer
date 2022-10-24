import { ActivityBar, after, CustomTreeSection, SideBarView, ViewContent, ViewControl, ViewTitlePart, Workbench, TreeItem, ContextMenu, InputBox, TitleActionButton, EditorView, NotificationType } from 'vscode-extension-tester';
import { expect } from 'chai';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson = require('../../package.json');
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

});
