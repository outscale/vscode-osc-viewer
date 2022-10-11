import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../node';


export abstract class FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly folderName: string) {
    }


	getTreeItem(): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(this.folderName, vscode.TreeItemCollapsibleState.Collapsed);
        return treeItem;
	}

	abstract getChildren(): Thenable<ExplorerNode[]> ;




}