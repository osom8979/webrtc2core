'use strict';

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

    media_list_path = 'medias';
}

/**
 * WebRTC2Core server information.
 *
 * @author zer0, 2020-02-13
 */
class WebRTC2CoreServerInfo
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
    /**
     * Initialize parameters.
     */
    private init = new WebRTC2CoreInitParams();

    /**
     * Server information.
     */
    private server = new WebRTC2CoreServerInfo();

    constructor(params?: WebRTC2CoreInitParams)
    {
        if (params) {
            this.init = params;
        }
    }

    getBaseUri(... paths: Array<string>): string
    {
        let result = this.init.origin;
        for (const k in paths) {
            result += '/' + paths[k];
        }
        return result;
    }

    getMediaListPath(): string
    {
        return this.getBaseUri(this.init.media_list_path);
    }

    run()
    {
        console.log("GET/medias/request ...");
        fetch(this.getMediaListPath())
            .then((response) => {
                return response.json();
            })
            .then((json) => {
                this.server.videos = json.videos;
                this.server.audios = json.audios;
                this.server.datas = json.datas;
                console.log("GET/medias/OK",
                    ": video=", this.server.videos,
                    ", audio=", this.server.audios,
                    ", data=", this.server.datas);
            })
            .catch((error) => {
                console.error("GET/medias/error: ", error);
            });
    }
}