import React, { useEffect, useRef } from "react";

const VideoView = ({ mirror, style, stream, ...props }) => {
  const videoRef = useRef(null);

  // function playPause() {
  //   if (videoRef.current.paused) videoRef.current.play();
  //   else videoRef.current.pause();
  // }

  useEffect(() => {
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <video
      poster={
        !stream
          ? "https://i.pinimg.com/originals/60/f6/e7/60f6e7294309c3ec67855e35eb1912da.gif"
          : null
      }
      ref={videoRef}
      autoPlay
      {...props}
      style={mirror ? { ...style, transform: "rotateY(180deg)" } : style}
    />
  );
};

export default VideoView;
