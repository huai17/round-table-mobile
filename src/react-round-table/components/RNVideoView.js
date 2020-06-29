import React, {useMemo} from 'react';
import {RTCView} from 'react-native-webrtc';

const getStreamUrl = stream => {
  if (!stream) return null;
  return stream.toURL();
};

const RNVideoView = ({stream, ...props}) => {
  const streamURL = useMemo(() => getStreamUrl(stream), [stream]);
  return <RTCView streamURL={streamURL} {...props} />;
};

export default RNVideoView;
