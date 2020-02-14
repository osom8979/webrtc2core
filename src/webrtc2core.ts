'use strict';

function createUrl(protocol: string, hostname: string, port: number | string): string
{
    return protocol + "//" + hostname + ":" + port;
}

function createDefaultUrl(): string
{
    return createUrl(location.protocol, window.location.hostname, window.location.port);
}

/**
 * WebRTC2Core parameters.
 *
 * @author zer0, 2020-02-13
 */
class WebRTC2CoreParams
{
    /**
     * Origin server address.
     *
     * Format:
     *  {protocol}://{hostname}:{port}
     */
    origin = createDefaultUrl();

    /**
     * Verbose flag.
     */
    verbose = false;

    media_list_path = '/medias';
    ice_servers_path = '/ice/servers';

    getBaseUri(... paths: Array<string>): string
    {
        let result = this.origin;
        for (const k in paths) {
            if (paths[k].charAt(0) != '/') {
                result += '/';
            }
            result += paths[k];
        }
        return result;
    }

    getMediaListUri(): string
    {
        return this.getBaseUri(this.media_list_path);
    }

    getIceServersUri(): string
    {
        return this.getBaseUri(this.ice_servers_path);
    }
}

/**
 * WebRTC2Core cache datas.
 *
 * @author zer0, 2020-02-13
 */
class WebRTC2CoreCache
{
    videos: Array<string>;
    audios: Array<string>;
    datas: Array<string>;

    exists() : boolean
    {
        if (this.videos || this.audios || this.datas) {
            return true;
        }
        return false;
    }
}

/**
 * WebRTC2Core main class.
 *
 * @author zer0, 2020-02-13
 */
export class WebRTC2Core
{
    private params = new WebRTC2CoreParams();
    private cache = new WebRTC2CoreCache();

    constructor(params?: WebRTC2CoreParams)
    {
        if (params) {
            this.params = params;
        }
    }

    public error(... message: any[]): void
    {
        console.error(message);
    }

    public log(... message: any[]): void
    {
        if (this.params.verbose) {
            console.log(message);
        }
    }

    public clearCache(): void
    {
        this.cache = new WebRTC2CoreCache();
    }

    private onMediaList(data: any)
    {
        this.cache.videos = data.videos;
        this.cache.audios = data.audios;
        this.cache.datas = data.datas;
        this.log("onMediaList(", "videos=", data.videos, ",audios=", data.audios, ",datas=", data.datas, ")");
        this.requestIceServers();
    }

    private onMediaListError(error: any): void
    {
        this.error("onMediaListError(", error, ")");
    }

    public async run()
    {
        this.log("run()");
        return fetch(this.params.getMediaListUri())
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.onMediaList(json);
            })
            .catch((error) => {
                this.onMediaListError(error);
            });
    }

    private requestIceServers()
    {
        this.log("requestIceServers()");
        fetch(this.params.getIceServersUri())
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.onMediaList(json);
            })
            .catch((error) => {
                this.onMediaListError(error);
            });
    }
}