import React, {useState, useCallback, useEffect, useRef} from 'react';
import {View, FlatList} from 'react-native';
import {useRoundTable} from '../react-round-table';
import {Input, Text, Button} from 'react-native-elements';

const ChatBox = ({style}) => {
  const [value, setValue] = useState('');
  const {chat} = useRoundTable();

  const send = () => {
    chat({message: value});
    setValue('');
  };

  return (
    <View style={{...style}}>
      <Input onChangeText={text => setValue(text)} value={value} />
      <Button title="Send" onPress={() => send()} />
    </View>
  );
};

const ChatRoom = ({selfId}) => {
  const [chatList, setChatList] = useState([]);

  const onChatReceived = useCallback(
    ({id, message, knight}) => {
      setChatList(chatList => [
        ...chatList,
        <View key={knight.id + id}>
          <Text style={{color: selfId === knight.id ? 'green' : 'white'}}>
            {knight.name}:{' '}
          </Text>
          <Text style={{color: 'white'}}>{message}</Text>
        </View>,
      ]);
    },
    [selfId],
  );

  const onKnightJoined = useCallback(({knight}) => {
    setChatList(chatList => [
      ...chatList,
      <Text
        key={knight.id + new Date().toDateString()}
        style={{color: '#ABB2B9'}}>
        {knight.name} Joind
      </Text>,
    ]);
  }, []);

  const onKnightLeft = useCallback(({knight}) => {
    setChatList(chatList => [
      ...chatList,
      <Text
        key={knight.id + new Date().toDateString()}
        style={{color: '#ABB2B9'}}>
        {knight.name} Left
      </Text>,
    ]);
  }, []);

  useRoundTable({
    onChatReceived,
    onKnightJoined,
    onKnightLeft,
  });

  const listRef = useRef(null);

  useEffect(() => {
    chatList.length && listRef.current.scrollToEnd();
  }, [chatList]);

  return (
    <View style={{width: '100%', height: '100%'}}>
      <FlatList
        ref={listRef}
        style={{width: '100%', maxHeight: '50%'}}
        data={chatList}
        renderItem={({item}) => item}
      />
      <ChatBox
        style={{
          width: '100%',
          height: '50%',
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
    </View>
  );
};

export default ChatRoom;
