import * as osc from "outscale-api";
import * as fetch from "cross-fetch";
import * as crypto from "crypto";
import { Profile } from "./node";

global.Headers = fetch.Headers;
global.crypto = crypto.webcrypto;

export function getConfig(profile: Profile): osc.Configuration {
    return new osc.Configuration({
        basePath: "https://api." + profile.region + ".outscale.com/api/v1",
        awsV4SignParameters: {
            accessKeyId: profile.accessKey,
            secretAccessKey: profile.secretKey,
            service: "api",
            region: profile.region,
        },
        fetchApi: fetch.default
    });
}