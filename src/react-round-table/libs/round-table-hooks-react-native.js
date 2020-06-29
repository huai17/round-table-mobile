import {useEffect} from 'react';

import {
  reserve,
  join,
  leave,
  changeSource,
  generateSeats,
  kickout,
  chat,
  connectPC,
  closePC,
  getStream,
  addListener,
  removeListener,
  ROUND_TABLE_EVENTS,
  toggleAudio,
  toggleVideo,
  switchCamera,
} from '../cores/react-native';

export const useRoundTable = (options = {}) => {
  const {
    onKnightJoined,
    onKnightLeft,
    onMeetingStarted,
    onMeetingStopped,
    onKnightConnected,
    onSourceChanged,
    onSeatsUpdated,
    onChatReceived,
    onError,
  } = options;

  useEffect(() => {
    onKnightJoined &&
      addListener(ROUND_TABLE_EVENTS.onKnightJoined, onKnightJoined);
    return () =>
      onKnightJoined &&
      removeListener(ROUND_TABLE_EVENTS.onKnightJoined, onKnightJoined);
  }, [onKnightJoined]);

  useEffect(() => {
    onKnightLeft && addListener(ROUND_TABLE_EVENTS.onKnightLeft, onKnightLeft);
    return () =>
      onKnightLeft &&
      removeListener(ROUND_TABLE_EVENTS.onKnightLeft, onKnightLeft);
  }, [onKnightLeft]);

  useEffect(() => {
    onKnightConnected &&
      addListener(ROUND_TABLE_EVENTS.onKnightConnected, onKnightConnected);
    return () =>
      onKnightConnected &&
      removeListener(ROUND_TABLE_EVENTS.onKnightConnected, onKnightConnected);
  }, [onKnightConnected]);

  useEffect(() => {
    onMeetingStarted &&
      addListener(ROUND_TABLE_EVENTS.onMeetingStarted, onMeetingStarted);
    return () =>
      onMeetingStarted &&
      removeListener(ROUND_TABLE_EVENTS.onMeetingStarted, onMeetingStarted);
  }, [onMeetingStarted]);

  useEffect(() => {
    onMeetingStopped &&
      addListener(ROUND_TABLE_EVENTS.onMeetingStopped, onMeetingStopped);
    return () =>
      onMeetingStopped &&
      removeListener(ROUND_TABLE_EVENTS.onMeetingStopped, onMeetingStopped);
  }, [onMeetingStopped]);

  useEffect(() => {
    onSourceChanged &&
      addListener(ROUND_TABLE_EVENTS.onSourceChanged, onSourceChanged);
    return () =>
      onSourceChanged &&
      removeListener(ROUND_TABLE_EVENTS.onSourceChanged, onSourceChanged);
  }, [onSourceChanged]);

  useEffect(() => {
    onSeatsUpdated &&
      addListener(ROUND_TABLE_EVENTS.onSeatsUpdated, onSeatsUpdated);
    return () =>
      onSeatsUpdated &&
      removeListener(ROUND_TABLE_EVENTS.onSeatsUpdated, onSeatsUpdated);
  }, [onSeatsUpdated]);

  useEffect(() => {
    onChatReceived &&
      addListener(ROUND_TABLE_EVENTS.onChatReceived, onChatReceived);
    return () =>
      onChatReceived &&
      removeListener(ROUND_TABLE_EVENTS.onChatReceived, onChatReceived);
  }, [onChatReceived]);

  useEffect(() => {
    onError && addListener(ROUND_TABLE_EVENTS.onError, onError);
    return () => onError && removeListener(ROUND_TABLE_EVENTS.onError, onError);
  }, [onError]);

  return {
    join,
    leave,
    reserve,
    changeSource,
    generateSeats,
    kickout,
    chat,
    connectPC,
    closePC,
    getStream,
    toggleAudio,
    toggleVideo,
    switchCamera,
  };
};
