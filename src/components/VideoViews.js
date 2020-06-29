import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-elements';
import {RNVideoView, useRoundTable} from '../react-round-table';

import ChatRoom from './ChatRoom';

const VideoViews = ({table, streams}) => {
  const {switchCamera, leave} = useRoundTable();

  return (
    <View style={{backgroundColor: 'black', flex: 1}}>
      <RNVideoView
        key="host"
        stream={streams[table.source]}
        style={{flex: 1}}
        zOrder={0}
      />
      <View
        style={{
          width: 250,
          height: 210,
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'black',
        }}>
        <RNVideoView
          key="self"
          mirror
          stream={streams[table.self.id]}
          style={{flex: 1}}
          zOrder={1}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}>
        <Button onPress={() => switchCamera()} title="Switch Camera" />
        <Button onPress={() => leave()} title="Leave Table" />
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 300,
        }}>
        <ChatRoom selfId={table.self.id} />
      </View>
    </View>
  );
};

export default VideoViews;
