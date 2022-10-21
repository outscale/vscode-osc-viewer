import * as vscode from 'vscode';
import { ExplorerNode, ExplorerFolderNode, Profile } from '../node';

export abstract class FolderNode implements ExplorerFolderNode {
    constructor(readonly profile: Profile, readonly folderName: string) {
    }

    getContextValue(): string {
        return "foldernode";
    }

    getTreeItem(): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(this.folderName, vscode.TreeItemCollapsibleState.Collapsed);
        treeItem.contextValue = this.getContextValue();
        return treeItem;
    }

    abstract getChildren(): Thenable<ExplorerNode[]>;




}