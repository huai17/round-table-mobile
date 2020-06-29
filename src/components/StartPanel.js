import React, {useState} from 'react';
import {View} from 'react-native';
import {useRoundTable} from '../react-round-table';
import {Input, Text, Button} from 'react-native-elements';

const StartPanel = () => {
  const [seatNumber, setSeatNumber] = useState('');
  const {join} = useRoundTable();

  return (
    <View style={{flex: 1}}>
      <Text h1 style={{alignSelf: 'center'}}>
        Round Table
      </Text>

      <View>
        <Input onChangeText={text => setSeatNumber(text)} value={seatNumber} />
        <Button title="Join Table" onPress={() => join({seatNumber})} />
      </View>
    </View>
  );
};

export default StartPanel;
