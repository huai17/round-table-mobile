import EventEmitter from "events";
import {
  addIceCandidate,
  processAnswer,
  stopCommunication,
  closePC,
} from "./webrtc-utils";

const Events = new EventEmitter();

export const ROUND_TABLE_EVENTS = {
  onServerConnected: "serverconnected",
  onMeetingStarted: "meetingstarted",
  onMeetingStopped: "meetingstopped",
  onKnightJoined: "knightjoined",
  onKnightLeft: "knightleft",
  onKnightConnected: "knightconnected",
  onSourceChanged: "sourcechanged",
  onSeatsUpdated: "seatsupdated",
  onChatReceived: "chatreceived",
  onError: "error",
};

export const addListener = (event, listener) => {
  typeof listener === "function" && Events.on(event, listener);
};

export const removeListener = (event, listener) => {
  typeof listener === "function" && Events.removeListener(event, listener);
};

export const triggerEvent = (event, ...args) => Events.emit(event, ...args);

export const handleConnectEvent = (_socket) =>
  triggerEvent(ROUND_TABLE_EVENTS.onServerConnected, { socketId: _socket.id });

export const handleMessageEvent = (message) => {
  switch (message.id) {
    case "startCommunication":
      _handleStartCommunication(message);
      break;
    case "stopCommunication":
      _handleStopCommunication();
      break;
    case "connectResponse":
      _handleConnectResponse(message);
      break;
    case "knightJoined":
      _handleKnightJoined(message);
      break;
    case "knightLeft":
      _handleKnightLeft(message);
      break;
    case "knightConnected":
      _handleKnightConnected(message);
      break;
    case "changeSource":
      _handleChangeSource(message);
      break;
    case "seatsUpdated":
      _handleSeatsUpdated(message);
      break;
    case "iceCandidate":
      _handleIceCandidate(message);
      break;
    case "chat":
      _handleChat(message);
      break;
    case "error":
      _handleError(message);
      break;

    default:
      console.error(`Unrecognized message: ${message.id}`);
  }
};

const _handleStartCommunication = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onMeetingStarted, {
    self: message.self,
    table: message.table,
  });

const _handleStopCommunication = () => {
  stopCommunication();
  triggerEvent(ROUND_TABLE_EVENTS.onMeetingStopped);
};

const _handleConnectResponse = (message) => {
  if (message.response !== "success") {
    console.error(`Connect failed for the following reason: `, message.error);
    closePC({ source: message.source });
    triggerEvent(ROUND_TABLE_EVENTS.onError, {
      message: "WebRTC peer connect fail",
      error: message.error,
    });
  } else
    processAnswer({ source: message.source, sdpAnswer: message.sdpAnswer });
};

const _handleKnightJoined = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onKnightJoined, {
    knight: message.knight,
  });

const _handleKnightLeft = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onKnightLeft, {
    knight: message.knight,
    isRemoved: message.isRemoved,
  });

const _handleKnightConnected = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onKnightConnected, {
    knight: message.knight,
  });

const _handleChangeSource = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onSourceChanged, {
    source: message.source,
  });

const _handleSeatsUpdated = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onSeatsUpdated, {
    seats: message.seats,
    numberOfSeats: message.numberOfSeats,
  });

const _handleIceCandidate = (message) =>
  addIceCandidate({ source: message.source, iceCandidate: message.candidate });

const _handleChat = (message) =>
  triggerEvent(ROUND_TABLE_EVENTS.onChatReceived, {
    id: message.uuid,
    timestamp: message.timestamp,
    message: message.message,
    knight: message.knight,
  });

const _handleError = (message) => {
  console.error(`Error: ${message.message}`);
  triggerEvent(ROUND_TABLE_EVENTS.onError, {
    message: message.message,
    error: message.error,
  });
};
