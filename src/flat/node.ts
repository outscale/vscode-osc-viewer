import * as vscode from 'vscode';

export interface ExplorerNodeBase {
    getChildren(): Thenable<ExplorerNode[]>;
    getTreeItem(): vscode.TreeItem;
}

export interface ExplorerProfileNode extends ExplorerNodeBase {
    readonly profile: Profile;
}

export interface ExplorerResourceNode extends ExplorerProfileNode {
    readonly resourceName: string;
    readonly resourceId: string;
}

export interface ExplorerFolderNode extends ExplorerProfileNode {
    readonly folderName: string;
}

export type ExplorerNode =
    ExplorerProfileNode |
    ExplorerFolderNode |
    ExplorerResourceNode;

export class NodeImpl {
}

export class Profile {
    constructor(
		public readonly name: string,
		public readonly accessKey: string,
		public readonly secretKey: string,
        public readonly region: string
	) {	}
}