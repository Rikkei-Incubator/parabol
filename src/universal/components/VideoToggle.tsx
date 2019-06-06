import React from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {StreamUI} from '../hooks/useSwarm'
import MediaSwarm from '../utils/swarm/MediaSwarm'
import MediaControlToggle from './MediaControlToggle'

const Toggle = styled(MediaControlToggle)({})
const StyledIcon = styled(Icon)({
  fontSize: 18
})

interface Props {
  localStreamUI: StreamUI
  swarm: MediaSwarm
}

const VideoToggle = (props: Props) => {
  const {swarm, localStreamUI} = props
  const {hasVideo} = localStreamUI
  const onClick = async () => {
    if (hasVideo) {
      swarm.muteWebcamVideo()
    } else {
      try {
        await swarm.broadcastWebcam('lowVideo')
      } catch (e) {
        /**/
      }
    }
  }
  return (
    <Toggle onClick={onClick}>
      <StyledIcon>{hasVideo ? 'videocam' : 'videocam_off'}</StyledIcon>
    </Toggle>
  )
}

export default VideoToggle
