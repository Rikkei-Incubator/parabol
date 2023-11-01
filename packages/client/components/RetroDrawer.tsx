import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Breakpoint, DiscussionThreadEnum} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDrawerTemplateCard from './RetroDrawerTemplateCard'
import {Drawer} from './TeamPrompt/TeamPromptDrawer'
import {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'

interface Props {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  queryRef: PreloadedQuery<RetroDrawerQuery>
}

const RetroDrawer = (props: Props) => {
  const {queryRef, showDrawer, setShowDrawer} = props
  const data = usePreloadedQuery<RetroDrawerQuery>(
    graphql`
      query RetroDrawerQuery($first: Int!, $type: MeetingTypeEnum!) {
        viewer {
          availableTemplates(first: $first, type: $type)
            @connection(key: "RetroDrawer_availableTemplates") {
            edges {
              node {
                ...RetroDrawerTemplateCard_template
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const templates = data.viewer.availableTemplates.edges
  const isMobile = !useBreakpoint(Breakpoint.FUZZY_TABLET)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer)
  }

  return (
    <ResponsiveDashSidebar
      isOpen={showDrawer}
      isRightDrawer
      onToggle={toggleDrawer}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer
        className='overflow-scroll'
        isDesktop={isDesktop}
        isMobile={isMobile}
        isOpen={showDrawer}
      >
        <div className='pt-4'>
          <div className='flex justify-between px-4'>
            <div className='pb-4 text-base font-semibold'>Templates</div>
            <div className='cursor-pointer text-slate-600 hover:opacity-50' onClick={toggleDrawer}>
              <Close />
            </div>
          </div>
          {templates.map((template) => (
            <RetroDrawerTemplateCard key={template.node.id} templateRef={template.node} />
          ))}
        </div>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}
export default RetroDrawer
