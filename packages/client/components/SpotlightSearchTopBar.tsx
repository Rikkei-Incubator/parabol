
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import PlainButton from './PlainButton/PlainButton'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'
import React from 'react'

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  position: 'absolute',
  right: 16
})

const CloseIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  fontSize: ICON_SIZE.MD24,
  '&:hover,:focus': {
    color: PALETTE.SLATE_800
  }
})

const Title = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'center'
})

const TopRow = styled('div')({
  width: `calc(100% - 48px)`, // 48px accounts for icon size
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

interface Props {
  closeSpotlight: () => void
}

const SpotlightSearchTopBar = (prop: Props) => {
  const {closeSpotlight} = prop
  return (
    <TopRow>
      <Title>Find cards with similar reflections</Title>
      <StyledCloseButton onClick={closeSpotlight}>
        <CloseIcon>close</CloseIcon>
      </StyledCloseButton>
    </TopRow>
  )
}

export default SpotlightSearchTopBar