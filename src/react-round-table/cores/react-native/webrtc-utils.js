import freeice from 'freeice';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';

const ICE_CONFIG = {iceServers: freeice()};

let _localStream = null;
let _isEnableAudio = true;
let _isEnableVideo = true;
let _pcs = {};

// get peerconnection of source
const _getPC = (options = {}) => {
  const {source} = options;
  if (!_pcs[source]) return null;
  if (!_pcs[source].pc || _pcs[source].pc.signalingState === 'closed') {
    closePC({source});
    return null;
  }
  return _pcs[source].pc;
};

// set peerconnection of source
const _setPC = (options = {}) => {
  const {source, pc} = options;
  if (_pcs[source]) closePC({source});
  _pcs[source] = {pc, cq: [], stream: null};
};

// get stream of source
export const getStream = (options = {}) => {
  const {source} = options;
  return _pcs[source] && _pcs[source].stream;
};

// set stream of source
const _setStream = (options = {}) => {
  const {source, stream} = options;
  if (!_pcs[source]) return;
  if (_pcs[source].stream)
    _pcs[source].stream
      .getTracks()
      .forEach(track => track.stop && track.stop());
  _pcs[source].stream = stream;
};

// get candidate queue of source
const _getQueue = (options = {}) => {
  const {source} = options;
  if (!_pcs[source]) return null;
  if (!_pcs[source].cq) _pcs[source].cq = [];
  return _pcs[source].cq;
};

// create sdpoffer of source
const _createOffer = ({source, offerReceive, sendMessage}) => {
  const pc = _getPC({source});
  if (!pc) throw new Error('PeerConnection does not exist');
  pc.createOffer({
    offerToReceiveAudio: offerReceive,
    offerToReceiveVideo: offerReceive,
  })
    .then(desc => {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      return pc.setLocalDescription(desc);
    })
    .then(() => {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      if (!pc.localDescription)
        throw new Error('LocalDescription does not exist');
      sendMessage({
        id: 'connect',
        source,
        sdpOffer: pc.localDescription.sdp,
      });
    });
};

// get user media
export const getMedia = async (options = {}) => {
  const {camera = 'front'} = options;
  const isFront = camera === 'front';

  const sourceInfos = await mediaDevices.enumerateDevices();

  const videoSourceId = sourceInfos.reduce(
    (videoSourceId, sourceInfo) =>
      sourceInfo.kind === 'videoinput' &&
      sourceInfo.facing === (isFront ? 'front' : 'environment')
        ? sourceInfo.deviceId
        : videoSourceId,
    null,
  );

  return await mediaDevices.getUserMedia({
    audio: true,
    video: {
      mandatory: {
        maxWidth: 560,
        maxHeight: 400,
        maxFrameRate: 30,
      },
      facingMode: isFront ? 'user' : 'environment',
      optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
    },
  });
};

// create peerconnection of source
export const createPC = (options = {}) => {
  const {source, sendMessage, localStream, onStreamReady} = options;
  console.debug(`Create PC <${source}>`);
  let pc = _getPC({source});
  if (pc) return pc;

  pc = new RTCPeerConnection(ICE_CONFIG);
  _setPC({source, pc});

  pc.onaddstream = event => {
    if (source !== 'self') _setStream({source, stream: event.stream});
    if (onStreamReady) onStreamReady(event);
  };

  if (localStream) {
    _setStream({source, stream: localStream});
    pc.addStream(localStream);
  }

  // pc.onnegotiationneeded = () =>
  //   console.debug(`PC <${source}> - onnegotiationneeded`);

  pc.onicecandidate = event => {
    console.debug(`PC <${source}> - onicecandidate`);
    if (event.candidate)
      sendMessage({id: 'onIceCandidate', source, candidate: event.candidate});
  };

  pc.oniceconnectionstatechange = event => {
    console.debug(
      `PC <${source}> - oniceconnectionstatechange: `,
      event.target.iceConnectionState,
    );
    if (event.target.iceConnectionState === 'disconnected') closePC({source});
  };

  pc.onsignalingstatechange = event => {
    console.debug(
      `PC <${source}> - onsignalingstatechange: `,
      event.target.signalingState,
    );
    if (event.target.signalingState === 'stable') {
      const pc = _getPC({source});
      if (!pc) throw new Error('PeerConnection does not exist');
      const candidatesQueue = _getQueue({source});
      while (candidatesQueue && candidatesQueue.length) {
        pc.addIceCandidate(candidatesQueue.shift());
      }
    }
  };

  setTimeout(
    () => _createOffer({source, offerReceive: !localStream, sendMessage}),
    0,
  );

  return pc;
};

// close peerconnection of source
export const closePC = (options = {}) => {
  const {source} = options;
  console.debug(`Close PC <${source}>`);
  if (!_pcs[source]) return;
  if (_pcs[source].stream) {
    _pcs[source].stream.release();
    _pcs[source].stream = null;
    _pcs[source].isEnableAudio = true;
    _pcs[source].isEnableVideo = true;
  }
  if (_pcs[source].pc && _pcs[source].pc.signalingState !== 'closed') {
    _pcs[source].pc.close();
    _pcs[source].pc = null;
  }
  _pcs[source].cq = [];
  delete _pcs[source];
};

// clean up
export const stopCommunication = () => {
  console.debug('Stop communication');
  for (let source in _pcs) closePC({source});
  _pcs = {};
};

// add icecandidate of source
export const addIceCandidate = async (options = {}) => {
  const {source, iceCandidate} = options;
  console.debug(`PC <${source}> ICE candidate received, adding ICE candidate`);
  const pc = _getPC({source});
  if (!pc) return;
  const candidate = new RTCIceCandidate(iceCandidate);
  if (pc.signalingState === 'stable' && pc.remoteDescription)
    return await pc.addIceCandidate(candidate);
  const candidatesQueue = _getQueue({source});
  if (candidatesQueue) candidatesQueue.push(candidate);
};

// process sdpanswer of source
export const processAnswer = async (options = {}) => {
  const {source, sdpAnswer} = options;
  console.debug(
    `PC <${source}> SDP answer received, setting remote description`,
  );
  const pc = _getPC({source});
  if (!pc) return;
  await pc.setRemoteDescription(
    new RTCSessionDescription({type: 'answer', sdp: sdpAnswer}),
  );
};

// toggle audio of source
export const toggleAudio = (options = {}) => {
  const {source = 'self'} = options;
  console.debug(`Toggle <${source}> audio source`);
  if (_pcs[source] && _pcs[source].stream) {
    _pcs[source].isEnableAudio = !_pcs[source].isEnableAudio;
    _pcs[source].stream
      .getAudioTracks()
      .forEach(track => (track.enabled = _pcs[source].isEnableAudio));
  }
  return _pcs[source].isEnableAudio;
};

// toggle video of source
export const toggleVideo = (options = {}) => {
  const {source = 'self'} = options;
  console.debug(`Toggle <${source}> video source`);
  if (_pcs[source] && _pcs[source].stream) {
    _pcs[source].isEnableVideo = !_pcs[source].isEnableVideo;
    _pcs[source].stream
      .getVideoTracks()
      .forEach(track => (track.enabled = _pcs[source].isEnableVideo));
  }
  return _pcs[source].isEnableVideo;
};

// switch camera
export const switchCamera = () => {
  if (_pcs['self'] && _pcs['self'].stream)
    _pcs['self'].stream
      .getVideoTracks()
      .forEach(track => track._switchCamera());
};
