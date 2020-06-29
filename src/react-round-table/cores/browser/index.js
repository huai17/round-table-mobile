import { v4 as uuidv4 } from "uuid";
import { getMedia, createPC, stopCommunication } from "./webrtc-utils";
import { sendMessage } from "./signal-utils";

export { getStream, closePC, toggleAudio, toggleVideo } from "./webrtc-utils";
export { connect } from "./signal-utils";
export { addListener, removeListener, ROUND_TABLE_EVENTS } from "./event-utils";

export const connectPC = async (options = {}) => {
  const { source, onStreamReady } = options;
  const createPCOptions = { source, sendMessage };
  if (source === "self") {
    const localStream = await getMedia();
    createPCOptions.localStream = localStream;
    if (onStreamReady) onStreamReady({ stream: localStream });
  } else {
    if (onStreamReady) createPCOptions.onStreamReady = onStreamReady;
  }
  return createPC(createPCOptions);
};

export const reserve = (options = {}) => {
  const { numberOfSeats, name } = options;
  sendMessage({ id: "reserve", numberOfSeats, name });
};

export const join = (options = {}) => {
  const { seatNumber, name } = options;
  if (!seatNumber) return;
  sendMessage({ id: "join", seatNumber, name });
};

export const leave = () => {
  sendMessage({ id: "leave" });
  stopCommunication();
};

export const changeSource = (options = {}) => {
  const { source } = options;
  sendMessage({ id: "changeSource", source });
};

export const generateSeats = (options = {}) => {
  const { numberOfSeats } = options;
  sendMessage({ id: "generateSeats", numberOfSeats });
};

export const kickout = (options = {}) => {
  const { seatNumber } = options;
  sendMessage({ id: "kickout", seatNumber });
};

export const chat = (options = {}) => {
  const { message } = options;
  sendMessage({ id: "chat", message, uuid: uuidv4() });
};
