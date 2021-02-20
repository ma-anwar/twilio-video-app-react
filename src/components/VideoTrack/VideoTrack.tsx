import React, { useRef, useEffect, useState } from 'react';
import { IVideoTrack } from '../../types';
import { styled } from '@material-ui/core/styles';
import { Track } from 'twilio-video';
import useMediaStreamTrack from '../../hooks/useMediaStreamTrack/useMediaStreamTrack';
import useVideoTrackDimensions from '../../hooks/useVideoTrackDimensions/useVideoTrackDimensions';
import axios from 'axios';

const Video = styled('video')({
  width: '100%',
  height: '100%',
});

interface VideoTrackProps {
  track: IVideoTrack;
  isLocal?: boolean;
  priority?: Track.Priority | null;
}

export default function VideoTrack({ track, isLocal, priority }: VideoTrackProps) {
  const ref = useRef<HTMLVideoElement>(null!);
  const mediaStreamTrack = useMediaStreamTrack(track);
  const dimensions = useVideoTrackDimensions(track);
  const isPortrait = (dimensions?.height ?? 0) > (dimensions?.width ?? 0);

  useEffect(() => {
    const el = ref.current;
    el.muted = true;
    if (track.setPriority && priority) {
      track.setPriority(priority);
    }
    track.attach(el);
    const interval = setInterval(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      //   var ctx = canvas.getContext('2d')
      //   ctx?.drawImage(ref.current, 0, 0, canvas.width, canvas.height)
      //   let frame = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      //   var data  = canvas.toDataURL('image/jpeg')

      //      axios.post('localhost:5000/expression', {imageData: data}).then((response) => {console.log(response.data)})

      // },5000)
    }, 5000);
    return () => {
      track.detach(el);
      if (track.setPriority && priority) {
        // Passing `null` to setPriority will set the track's priority to that which it was published with.
        track.setPriority(null);
      }
    };
  }, [track, priority]);

  // The local video track is mirrored if it is not facing the environment.
  const isFrontFacing = mediaStreamTrack?.getSettings().facingMode !== 'environment';
  const style = {
    transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
    objectFit: isPortrait || track.name.includes('screen') ? ('contain' as const) : ('cover' as const),
  };

  return (
    <div>
      <Video ref={ref} style={style} />;
    </div>
  );
}
