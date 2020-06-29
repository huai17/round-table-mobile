import React, {useState, useCallback} from 'react';
import {SafeAreaView} from 'react-native';
import {useRoundTable} from './src/react-round-table';

import StartPanel from './src/components/StartPanel';
import VideoViews from './src/components/VideoViews';

const App = () => {
  const [table, setTable] = useState(null);
  const [streams, setStreams] = useState({});

  const {connectPC, closePC} = useRoundTable();

  // Round Table listeners
  const onMeetingStarted = useCallback(
    ({self, table}) => {
      setTable({...table, self});

      for (const knightId in table.knights) {
        connectPC({
          source: self.id === knightId ? 'self' : knightId,
          onStreamReady: ({stream}) => {
            setStreams(streams => ({...streams, [knightId]: stream}));
          },
        });
      }
    },
    [connectPC],
  );

  const onMeetingStopped = useCallback(() => {
    setTable(null);
    setStreams({});
  }, []);

  const onKnightJoined = useCallback(({knight}) => {
    setTable(table => {
      const cloneKnights = {...table.knights};
      cloneKnights[knight.id] = knight;

      if (table.seats && table.seats[knight.seatNumber]) {
        const cloneSeats = {...table.seats};
        cloneSeats[knight.seatNumber] = knight.id;
        return {...table, knights: cloneKnights, seats: cloneSeats};
      }

      return {...table, knights: cloneKnights};
    });
  }, []);

  const onKnightLeft = useCallback(
    ({knight, isRemoved}) => {
      setTable(table => {
        const cloneKnights = {...table.knights};
        delete cloneKnights[knight.id];

        if (table.seats && table.seats[knight.seatNumber]) {
          const cloneSeats = {...table.seats};
          cloneSeats[knight.seatNumber] = isRemoved ? 'removed' : 'available';
          return {...table, knights: cloneKnights, seats: cloneSeats};
        }

        return {...table, knights: cloneKnights};
      });
      setStreams(streams => {
        const newStreams = {...streams};
        delete newStreams[knight.id];
        return newStreams;
      });
      closePC({source: knight.id});
    },
    [closePC],
  );

  const onKnightConnected = useCallback(
    ({knight}) => {
      setTable(table => {
        const cloneKnights = {...table.knights};
        if (!cloneKnights[knight.id]) cloneKnights[knight.id] = knight;
        cloneKnights[knight.id].isConnected = true;
        return {...table, knights: cloneKnights};
      });
      connectPC({
        source: knight.id,
        onStreamReady: ({stream}) => {
          setStreams(streams => ({...streams, [knight.id]: stream}));
        },
      });
    },
    [connectPC],
  );

  const onSourceChanged = useCallback(({source}) => {
    setTable(table => ({...table, source}));
  }, []);

  const onSeatsUpdated = useCallback(({seats, numberOfSeats}) => {
    setTable(table => ({...table, seats, numberOfSeats}));
  }, []);

  // Round Table
  useRoundTable({
    onKnightJoined,
    onKnightLeft,
    onKnightConnected,
    onMeetingStarted,
    onMeetingStopped,
    onSourceChanged,
    onSeatsUpdated,
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      {table ? <VideoViews table={table} streams={streams} /> : <StartPanel />}
    </SafeAreaView>
  );
};

export default App;
