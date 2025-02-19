import {CHECKIN} from '../../../client/utils/constants'
import Meeting from '../../database/types/Meeting'
import {Team} from '../../postgres/queries/getTeamsByIds'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingTeamPrompt from '../../database/types/MeetingTeamPrompt'
import MeetingTemplate from '../../database/types/MeetingTemplate'

export const createMeetingProperties = (
  meeting: Meeting,
  meetingMembers?: MeetingMember[],
  template?: MeetingTemplate,
  team?: Team
) => {
  const {id: meetingId, teamId, facilitatorUserId, meetingType, phases} = meeting
  const hasIcebreaker = phases.some(({phaseType}) => phaseType === CHECKIN)
  const hasTeamHealth = phases.some(({phaseType}) => phaseType === 'TEAM_HEALTH')
  return {
    meetingId,
    teamId,
    facilitatorUserId,
    meetingType,
    hasIcebreaker,
    hasTeamHealth,
    teamMembersPresentCount: meetingMembers?.length,
    meetingTemplateId: template?.id,
    meetingTemplateName: template?.name,
    meetingTemplateScope: template?.scope,
    meetingTemplateIsFromParabol: template?.isStarter ?? false,
    meetingTemplateIsFree: template?.isFree ?? false,
    meetingTemplateCategory: template?.mainCategory,
    meetingSeriesId:
      meetingType === 'teamPrompt' ? (meeting as MeetingTeamPrompt).meetingSeriesId : undefined,
    disableAnonymity:
      meetingType === 'retrospective'
        ? (meeting as MeetingRetrospective).disableAnonymity ?? false
        : undefined,
    isOneOnOneTeam: team?.isOneOnOneTeam
  }
}
