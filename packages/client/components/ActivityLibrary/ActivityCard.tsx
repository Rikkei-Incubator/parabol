import clsx from 'clsx'
import React, {PropsWithChildren} from 'react'
import retroBackgroundSrc from '../../../../static/images/illustrations/retro-background.png'
import standupBackgroundSrc from '../../../../static/images/illustrations/standup-background.png'
import feedbackBackgroundSrc from '../../../../static/images/illustrations/feedback-background.png'
import estimationBackgroundSrc from '../../../../static/images/illustrations/estimation-background.png'
import strategyBackgroundSrc from '../../../../static/images/illustrations/strategy-background.png'
import customBackgroundSrc from '../../../../static/images/illustrations/custom-background.png'
import {upperFirst} from '../../utils/upperFirst'
import {MeetingTypeEnum} from '../../__generated__/NewMeetingQuery.graphql'
import {CategoryID, CATEGORY_TEXT_COLORS, MEETING_TYPE_TO_CATEGORY} from './Categories'

export interface CardTheme {
  primary: string
  secondary: string
}

const backgroundImgMap = {
  retrospective: retroBackgroundSrc,
  standup: standupBackgroundSrc,
  feedback: feedbackBackgroundSrc,
  estimation: estimationBackgroundSrc,
  strategy: strategyBackgroundSrc,
  premortem: customBackgroundSrc, // TODO: replace with premortem image
  postmortem: customBackgroundSrc // TODO: replace with postmortem image
} as const

type ActivityCardImageProps = {
  className?: string
  src: string
  category: CategoryID
}

export const ActivityCardImage = (props: PropsWithChildren<ActivityCardImageProps>) => {
  const {className, src, category} = props
  const backgroundSrc = backgroundImgMap[category] ?? retroBackgroundSrc

  return (
    <div
      className={clsx(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        className
      )}
    >
      <img
        className='absolute z-0 h-full w-full object-cover'
        src={backgroundSrc}
        alt='Background'
      />
      <img
        className='absolute top-0 left-0 z-10 h-full w-full object-contain p-10'
        src={src}
        alt='Card Illustration'
      />
    </div>
  )
}

export interface ActivityCardProps {
  className?: string
  theme: CardTheme
  title?: string
  badge?: React.ReactNode
  children?: React.ReactNode
  type?: MeetingTypeEnum
}

export const ActivityCard = (props: ActivityCardProps) => {
  const {className, theme, title, children, type, badge} = props
  const category = type && MEETING_TYPE_TO_CATEGORY[type]
  const color = category && CATEGORY_TEXT_COLORS[category].primary

  return (
    <div className='flex w-full flex-col'>
      <div
        className={clsx(
          'relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg',
          theme.secondary,
          className
        )}
      >
        <div className='flex-1'>
          {children}
          <div className='absolute bottom-0 right-0'>{badge}</div>
        </div>
      </div>
      {title && category && (
        <div className='mt-2 px-2 pb-2'>
          <div className='truncate text-sm leading-5 text-slate-800 sm:text-base'>{title}</div>
          <div className={clsx('font-semibold italic', color)}>{upperFirst(category)}</div>
        </div>
      )}
    </div>
  )
}
