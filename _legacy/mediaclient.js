
function genUUID()
{
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function MediaClient(configuration)
{
    this.video = configuration.video;
    this.audio = configuration.audio;
    this.data = configuration.data;
    this.video_element = configuration.video_element;
    this.video_width = configuration.video_width || 800;
    this.video_height = configuration.video_height || 480;
    this.video_fps = configuration.video_fps || 30;
    this.video_elem = configuration.video_elem;
    this.verbose = configuration.verbose || true;
    this.host = configuration.host || location.protocol + "//" + window.location.hostname + ":" + window.location.port;
    this.pc_configuration = { iceServers: [ { url: "stun:stun.l.google.com:19302" } ] };

    // https://webrtc.org/web-apis/chrome/
    this.pc_options = { optional: [ { DtlsSrtpKeyAgreement: true }, { RtpDataChannels: true } ] };
    this.media_constraints = { offerToReceiveAudio: true, offerToReceiveVideo: true };
    this.peer_id = genUUID();
    this.early_candidates = [];

    if (this.verbose) {
        console.log("MediaClient: ", configuration);
        console.log("Host URL: ", this.host);
        console.log("Peer ID: ", this.peer_id);
    }
}

MediaClient.prototype.getExchangeUri = function() {
    return this.host + '/exchange?peer_id=' + this.peer_id +
        "&videos=" + this.video +
        "&audios=" + this.audio +
        "&datas=" + this.data;
};

MediaClient.prototype.getAddIceCandidateUri = function() {
    return this.host + '/ice/candidate/add?peer_id=' + this.peer_id;
};

MediaClient.prototype.getGetIceCandidateUri = function() {
    return this.host + '/ice/candidate/get?peer_id=' + this.peer_id;
};

MediaClient.prototype.connect = function() {
    const self = this;
    fetch(this.host + '/ice/servers')
        .then(function(response) {
            return response.json();
        })
        .then(function(servers) {
            if (servers) {
                self.pc_configuration.iceServers = servers;
            }
            if (self.verbose) {
                console.log("Peer connection configuration: ", JSON.stringify(self.pc_configuration));
                console.log("Peer connection options: ", JSON.stringify(self.pc_options));
            }

            try {
                self.pc = new RTCPeerConnection(self.pc_configuration, self.pc_options);
                self.pc.onicecandidate = function(event) {
                    self.onIceCandidate.call(self, event);
                };
                self.pc.onaddstream = function(event) {
                   console.log("~~~~~~~~~~~~` Remote track added:" +  JSON.stringify(event));
                   // self.onTrack.call(self, event);
                   console.log("Add stream !!!", event);
                    self.video_element.srcObject = event.stream;
                    self.video_element.setAttribute("playsinline", true);
                    self.video_element.play();
                };
                //self.pc.ontrack = function(event) {
                //    console.log("Track !!!", event);
                //    self.onTrack.call(self, event);
                //};
                self.pc.oniceconnectionstatechange = function(event) {
                    self.onIceConnectionStateChange.call(self, event);
                };
                self.pc.ondatachannel = function(event) {
                    self.onDataChannel.call(self, event);
                };
            } catch (e) {
                console.error("Peer connection error: ", e);
            }

            if (self.data) {
                try {
                    self.data_channel = self.pc.createDataChannel(self.data);
                    self.data_channel.onopen = function() {
                        console.log("Data channel is open!");
                    };
                    self.data_channel.onmessage = function(event) {
                        console.log("Data channel recv: ", JSON.stringify(event.data));
                    }
                } catch (e) {
                    console.error("Cannot create data channel error: " + e);
                }
            }

            self.early_candidates.length = 0;

            self.pc.createOffer(self.media_constraints).then(function(offer){
                console.log("Create offer:" + JSON.stringify(offer));
                self.offer = offer;
                return self.pc.setLocalDescription(offer);
            }).then(function(){
                // Send the offer to the remote peer using the signaling server
                console.log("Set local description:" + JSON.stringify(self.offer));
                const uri = self.getExchangeUri();
                console.log("Exchange Session Description: " + uri);
                fetch(uri, {body: JSON.stringify(self.offer), method: "POST"})
                    .then(function(response){
                        return response.json();
                    })
                    .then(function(answer){
                        console.log("Call result: ", JSON.stringify(answer))
                        self.pc.setRemoteDescription(answer)
                            .then(function(){
                                for (const candidates in self.early_candidates) {
                                    const uri = self.getAddIceCandidateUri();
                                    fetch(uri, {body: JSON.stringify(self.early_candidates[candidates]), method: "POST"})
                                        .then(function(response){
                                            return response.json();
                                        })
                                        .then(function(json_text) {
                                            console.log("Add ICE Candidate: ", json_text)
                                        });
                                }

                                fetch(self.getGetIceCandidateUri())
                                    .then(function(response){
                                        return response.json();
                                    })
                                    .then(function(json_text) {
                                        self.onReceiveIceCandidate(json_text);
                                    });
                            });
                    }).catch(function(e){
                        console.error("Call error: ", e);
                    });
            }).catch(function(e){
                console.error("Create offer error: ", e);
            });
        });
};

MediaClient.prototype.onIceCandidate = function(event) {
    if (event.candidate) {
        if (this.pc.currentRemoteDescription)  {
            console.log("Current RemoteDescription: ", this.pc.currentRemoteDescription);
            const self = this;
            fetch(self.host + '/ice/candidate/add?peer_id=' + self.peer_id, {body: JSON.stringify(event.candidate), method: "POST"})
                .then(function(response){
                    return response.json();
                })
                .then(function(json_text) {
                    console.log("JSON: ", json_text)
                });
        } else {
            console.log("Push candidate: ", event.candidate);
            this.early_candidates.push(event.candidate);
        }
    } else {
        console.log("End of candidates.");
    }
};

MediaClient.prototype.onTrack = function(event) {
    if (this.verbose) {
        console.log("Remote track added: ", JSON.stringify(event));
    }

    // console.log("Remote track added:" +  JSON.stringify(event));
    //
    // var videoElement = document.getElementById(this.videoElement);
    // videoElement.srcObject = event.stream;
    // videoElement.setAttribute("playsinline", true);
    // videoElement.play();
};

MediaClient.prototype.onIceConnectionStateChange = function(event) {
    if (this.verbose) {
        console.log("Change ICE connection state: ", this.pc.iceConnectionState);
    }

    // console.log("oniceconnectionstatechange  state: " + pc.iceConnectionState);
    // var videoElement = document.getElementById(streamer.videoElement);
    // if (videoElement) {
    //     if (pc.iceConnectionState === "connected") {
    //         videoElement.style.opacity = "1.0";
    //     }
    //     else if (pc.iceConnectionState === "disconnected") {
    //         videoElement.style.opacity = "0.25";
    //     }
    //     else if ( (pc.iceConnectionState === "failed") || (pc.iceConnectionState === "closed") )  {
    //         videoElement.style.opacity = "0.5";
    //     }
    // }
};

MediaClient.prototype.onDataChannel = function(event) {
    if (this.verbose) {
        console.log("Remote data channel crated: ", JSON.stringify(event));
    }
    event.channel.onopen = function () {
        console.log("Remote datachannel open.");
    };
    event.channel.onmessage = function (event) {
        console.log("Remote datachannel recv: " + JSON.stringify(event.data));
    };
    event.channel.onclose = function () {
        console.log("Remote datachannel close.");
    };
};

MediaClient.prototype.onReceiveIceCandidate = function(json_text) {
    console.log("Receive ICE candidate: " + JSON.stringify(json_text));
    for (const i in json_text) {
        const candidate = new RTCIceCandidate(json_text[i]);
        console.log("Adding ICE candidate :" + JSON.stringify(candidate));
        this.pc.addIceCandidate(candidate)
            .then(function(){
                console.log("Add ICE candidate OK");
            })
            .catch(function (error){
                console.log("Add ICE candidate error: " + error);
            });
    }
    this.pc.addIceCandidate();
};

