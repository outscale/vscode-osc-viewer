import { ThemeIcon } from 'vscode';
import { deleteVm, startVm, stopVm } from '../cloud/vm';
import { deleteVolume } from '../cloud/volume';
import { Profile } from './node';
import { ResourceNode } from './node.resources';


export class VolumeResourceNode extends ResourceNode {

    constructor(readonly profile: Profile, readonly resourceName: string, readonly resourceId: string, readonly resourceState:string) {
		super(profile, resourceName, resourceId, "volumes", deleteVolume);
    }

	getContextValue(): string {
		return "volumeresourcenode";
	}

	getIconPath(): ThemeIcon {
		switch (this.resourceState) {
			case "creating":
				return new ThemeIcon("repo-create");
			case "available":
				return new ThemeIcon("check");
			case "in-use":
				return new ThemeIcon("plug");
			case "updating":
				return new ThemeIcon("sync");
			case "deleting":
				return new ThemeIcon("trash");
			case "error":
				return new ThemeIcon("alert");
			default:
				return new ThemeIcon("dash");
		}
		
	}

}