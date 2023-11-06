import React from 'react'
import IconLabel from './IconLabel'
import {Menu} from '../ui/Menu/Menu'
import {MenuItem} from '../ui/Menu/MenuItem'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import {OptionsButton} from './TeamPrompt/TeamPromptOptions'
import useTooltip from '../hooks/useTooltip'
import {MenuPosition} from '../hooks/useCoords'

type Props = {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  hasReflections: boolean
}

const MeetingOptions = (props: Props) => {
  const {setShowDrawer, showDrawer, hasReflections} = props
  const {openTooltip, tooltipPortal, originRef, closeTooltip} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )

  const handleClick = () => {
    if (hasReflections) return
    setShowDrawer(!showDrawer)
  }

  const handleMouseEnter = () => {
    if (hasReflections) {
      openTooltip()
    }
  }

  const handleMouseLeave = () => {
    closeTooltip()
  }

  return (
    <Menu
      trigger={
        <OptionsButton>
          <IconLabel icon='tune' iconLarge />
          <div className='text-slate-700'>Options</div>
        </OptionsButton>
      }
    >
      <div ref={originRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <MenuItem onClick={handleClick} isDisabled={hasReflections}>
          <div className='mr-3 flex text-slate-700'>{<SwapHorizIcon />}</div>
          Change template
        </MenuItem>
      </div>
      {tooltipPortal('You can only change the template before reflections have been added.')}
    </Menu>
  )
}

export default MeetingOptions
