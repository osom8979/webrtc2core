'use strict';

// import adapter from 'webrtc-adapter';
// import axios from 'axios';

function createUrl(protocol: string, hostname: string, port: number | string) : string
{
    return protocol + "//" + hostname + ":" + port;
}

function createDefaultUrl() : string
{
    return createUrl(location.protocol, window.location.hostname, window.location.port);
}

/**
 * WebRTC2Core initialize parameters.
 *
 * @author zer0, 2020-02-13
 */
class WebRTC2CoreInitParams
{
    media_list_path = 'media';
    request_timeout = 8000;
}

/**
 * WebRTC2Core main class.
 *
 * @author zer0, 2020-02-13
 */
export class WebRTC2Core
{
    private _params = new WebRTC2CoreInitParams();
    private _base_server_address = createDefaultUrl();
    // private _axios = axios.create();

    constructor(address?: string, params?: WebRTC2CoreInitParams)
    {
        if (address) {
            this._base_server_address = address;
        }
        if (params) {
            this._params = params;
        }

        // this._axios.defaults.timeout = this._params.request_timeout;
    }

    getBaseUri(... paths: Array<string>): string
    {
        let result = this._base_server_address;
        for (const path in paths) {
            result += '/' + path;
        }
        return result;
    }

    getMediaListPath(): string
    {
        return this.getBaseUri(this._params.media_list_path);
    }

    requestGet(path: string)
    {
        // return this._axios.get(path);
    }

    run(): boolean
    {
        // this.requestGet(this.getMediaListPath())
        //     .then((response) => {
        //         return response.data.json();
        //     })
        //     .then((response) => {
        //         console.log(response);
        //     })
        //     .catch((error) => {
        //         console.log(error);
        //     })
        //     .then(() => {
        //         // always executed
        //     });
        return true;
    }
}