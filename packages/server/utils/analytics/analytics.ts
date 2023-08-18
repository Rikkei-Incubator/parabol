import {PARABOL_AI_USER_ID} from '../../../client/utils/constants'
import {ReasonToDowngradeEnum} from '../../../client/__generated__/DowngradeToStarterMutation.graphql'
import {TeamLimitsEmailType} from '../../billing/helpers/sendTeamsLimitEmail'
import Meeting from '../../database/types/Meeting'
import MeetingMember from '../../database/types/MeetingMember'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import MeetingTemplate from '../../database/types/MeetingTemplate'
import {Reactable} from '../../database/types/Reactable'
import {TaskServiceEnum} from '../../database/types/Task'
import {ReactableEnum} from '../../graphql/private/resolverTypes'
import {IntegrationProviderServiceEnumType} from '../../graphql/types/IntegrationProviderServiceEnum'
import {UpgradeCTALocationEnumType} from '../../graphql/types/UpgradeCTALocationEnum'
import {TeamPromptResponse} from '../../postgres/queries/getTeamPromptResponsesByIds'
import {MeetingTypeEnum} from '../../postgres/types/Meeting'
import {MeetingSeries} from '../../postgres/types/MeetingSeries'
import {createMeetingProperties} from './helpers'
import {SegmentAnalytics} from './segment/SegmentAnalytics'
import {AmplitudeAnalytics} from './amplitude/AmplitudeAnalytics'
import getDataLoader from '../../graphql/getDataLoader'

export type MeetingSeriesAnalyticsProperties = Pick<
  MeetingSeries,
  'id' | 'duration' | 'recurrenceRule' | 'meetingType' | 'title'
> & {teamId: string; facilitatorId: string}

export type IdentifyOptions = {
  userId: string
  email: string
  anonymousId?: string
  name?: string
  isActive?: boolean
  featureFlags?: string[]
  highestTier?: string
  isPatient0?: boolean
  createdAt?: Date
}

export type OrgTierChangeEventProperties = {
  orgId: string
  domain?: string
  orgName: string
  oldTier: string
  newTier: string
  reasonsForLeaving?: ReasonToDowngradeEnum[]
  otherTool?: string
  billingLeaderEmail?: string
}

export type TaskProperties = {
  taskId: string
  teamId: string
  meetingId?: string
  meetingType?: MeetingTypeEnum
  inMeeting: boolean
}

export type TaskEstimateProperties = {
  taskId: string
  meetingId: string
  dimensionName: string
  service?: TaskServiceEnum
  success: boolean
  errorMessage?: string
}

export type MeetingSettings = {
  hasIcebreaker?: boolean
  hasTeamHealth?: boolean
  disableAnonymity?: boolean
  videoMeetingURL?: string | null
  recallBotId?: string | null
}

export type WebSocketProperties = {
  socketCount: number
  socketId: string
  tms: string[]
}

export type AnalyticsEvent =
  // meeting
  | 'Meeting Started'
  | 'Meeting Joined'
  | 'Meeting Completed'
  | 'Comment Added'
  | 'Response Added'
  | 'Reactji Interacted'
  | 'Meeting Recurrence Started'
  | 'Meeting Recurrence Stopped'
  | 'Meeting Settings Changed'
  // team
  | 'Team Name Changed'
  | 'Integration Added'
  | 'Integration Removed'
  | 'Invite Email Sent'
  | 'Invite Accepted'
  | 'Sent Invite Accepted'
  | 'Notification Email Sent'
  // org
  | 'Upgrade CTA Clicked'
  | 'Organization Upgraded'
  | 'Downgrade Clicked'
  | 'Downgrade Continue Clicked'
  | 'Organization Downgraded'
  | 'Billing Leader Modified'
  // task
  | 'Task Created'
  | 'Task Published'
  | 'Task Estimate Set'
  // user
  | 'Account Created'
  | 'Account Paused'
  | 'Account Unpaused'
  | 'Account Name Changed'
  | 'User Removed From Org'
  | 'Connect WebSocket'
  | 'Disconnect WebSocket'
  | 'Summary Email Setting Changed'
  // snackbar
  | 'Snackbar Clicked'
  | 'Snackbar Viewed'
  // Join request
  | 'Join Request Reviewed'
  // Suggest Groups
  | 'Suggested Groups Generated'
  | 'Suggest Groups Clicked'
  | 'Reset Groups Clicked'
  // Deprecated Events
  // These will be replaced with tracking plan compliant versions by the data team
  | 'Added Agenda Item'
  | 'Archive Organization'
  | 'Enterprise Over User Limit'
  | 'New Org'
  | 'New Team'

/**
 * Provides a unified interface for sending all the analytics events
 */
class Analytics {
  private amplitudeAnalytics: AmplitudeAnalytics
  private segmentAnalytics: SegmentAnalytics

  constructor() {
    this.amplitudeAnalytics = new AmplitudeAnalytics()
    this.segmentAnalytics = new SegmentAnalytics()
  }

  // meeting
  teamPromptEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    responses: TeamPromptResponse[]
  ) => {
    const userIdsResponses: Record<string, string> = responses.reduce(
      (previous, response) => ({...previous, [response.userId]: response.plaintextContent}),
      {}
    )
    meetingMembers.forEach((meetingMember) => {
      const plaintextResponseContent = userIdsResponses[meetingMember.userId]
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, undefined, {
        responseAdded: !!plaintextResponseContent
      })
    })
  }

  checkInEnd = (completedMeeting: Meeting, meetingMembers: MeetingMember[]) => {
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers)
    )
  }

  retrospectiveEnd = (
    completedMeeting: MeetingRetrospective,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    const {disableAnonymity} = completedMeeting
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, template, {
        disableAnonymity
      })
    )
  }

  sprintPokerEnd = (
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template: MeetingTemplate
  ) => {
    meetingMembers.forEach((meetingMember) =>
      this.meetingEnd(meetingMember.userId, completedMeeting, meetingMembers, template)
    )
  }

  private meetingEnd = (
    userId: string,
    completedMeeting: Meeting,
    meetingMembers: MeetingMember[],
    template?: MeetingTemplate,
    meetingSpecificProperties?: any
  ) => {
    this.track(userId, 'Meeting Completed', {
      wasFacilitator: completedMeeting.facilitatorUserId === userId,
      ...createMeetingProperties(completedMeeting, meetingMembers, template),
      ...meetingSpecificProperties
    })
  }

  meetingStarted = (userId: string, meeting: Meeting, template?: MeetingTemplate) => {
    this.track(userId, 'Meeting Started', createMeetingProperties(meeting, undefined, template))
  }

  recurrenceStarted = (userId: string, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(userId, 'Meeting Recurrence Started', meetingSeries)
  }

  recurrenceStopped = (userId: string, meetingSeries: MeetingSeriesAnalyticsProperties) => {
    this.track(userId, 'Meeting Recurrence Stopped', meetingSeries)
  }

  meetingJoined = (userId: string, meeting: Meeting) => {
    this.track(userId, 'Meeting Joined', createMeetingProperties(meeting))
  }

  meetingSettingsChanged = (
    userId: string,
    teamId: string,
    meetingType: MeetingTypeEnum,
    meetingSettings: MeetingSettings
  ) => {
    this.track(userId, 'Meeting Settings Changed', {
      teamId,
      meetingType,
      ...meetingSettings
    })
  }

  commentAdded = (
    userId: string,
    meeting: Meeting,
    isAnonymous: boolean,
    isAsync: boolean,
    isReply: boolean
  ) => {
    this.track(userId, 'Comment Added', {
      meetingId: meeting.id,
      meetingType: meeting.meetingType,
      teamId: meeting.teamId,
      isAnonymous,
      isAsync,
      isReply
    })
  }

  responseAdded = (
    userId: string,
    meetingId: string,
    teamPromptResponseId: string,
    isUpdate: boolean
  ) => {
    this.track(userId, 'Response Added', {
      meetingId,
      teamPromptResponseId,
      isUpdate
    })
  }

  reactjiInteracted = (
    userId: string,
    meetingId: string,
    meetingType: MeetingTypeEnum,
    reactable: Reactable,
    reactableType: ReactableEnum,
    reactji: string,
    isRemove: boolean
  ) => {
    const isAIComment = 'createdBy' in reactable && reactable.createdBy === PARABOL_AI_USER_ID
    const {id: reactableId} = reactable
    this.track(userId, 'Reactji Interacted', {
      meetingId,
      meetingType,
      reactableId,
      reactableType,
      reactji,
      isRemove,
      isAIComment
    })
  }

  // team
  teamNameChanged = (
    userId: string,
    teamId: string,
    oldName: string,
    newName: string,
    isOldNameDefault: boolean
  ) => {
    this.track(userId, 'Team Name Changed', {
      teamId,
      oldName,
      newName,
      isOldNameDefault
    })
  }

  integrationAdded = (
    userId: string,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(userId, 'Integration Added', {
      teamId,
      service
    })
  }

  integrationRemoved = (
    userId: string,
    teamId: string,
    service: IntegrationProviderServiceEnumType | 'slack'
  ) => {
    this.track(userId, 'Integration Removed', {
      teamId,
      service
    })
  }

  inviteEmailSent = (
    userId: string,
    teamId: string,
    inviteeEmail: string,
    isInviteeParabolUser: boolean,
    inviteTo: 'meeting' | 'team',
    success: boolean,
    isInvitedOnCreation: boolean
  ) => {
    this.track(userId, 'Invite Email Sent', {
      teamId,
      inviteeEmail,
      isInviteeParabolUser,
      inviteTo,
      success,
      isInvitedOnCreation
    })
  }

  inviteAccepted = (
    userId: string,
    teamId: string,
    inviterId: string,
    isNewUser: boolean,
    acceptAt: 'meeting' | 'team'
  ) => {
    this.track(userId, 'Invite Accepted', {
      teamId,
      inviterId,
      isNewUser,
      acceptAt
    })

    this.track(inviterId, 'Sent Invite Accepted', {
      teamId,
      inviteeId: userId,
      isNewUser,
      acceptAt
    })
  }

  //org
  clickedUpgradeCTA = (userId: string, upgradeCTALocation: UpgradeCTALocationEnumType) => {
    this.track(userId, 'Upgrade CTA Clicked', {upgradeCTALocation})
  }

  organizationUpgraded = (userId: string, upgradeEventProperties: OrgTierChangeEventProperties) => {
    this.track(userId, 'Organization Upgraded', upgradeEventProperties)
  }

  organizationDowngraded = (
    userId: string,
    downgradeEventProperties: OrgTierChangeEventProperties
  ) => {
    this.track(userId, 'Organization Downgraded', downgradeEventProperties)
  }

  // task
  taskPublished = (
    userId: string,
    taskProperties: TaskProperties,
    service: IntegrationProviderServiceEnumType
  ) => {
    this.track(userId, 'Task Published', {
      ...taskProperties,
      service
    })
  }

  taskCreated = (userId: string, taskProperties: TaskProperties) => {
    this.track(userId, 'Task Created', taskProperties)
  }

  taskEstimateSet = (userId: string, taskEstimateProperties: TaskEstimateProperties) => {
    this.track(userId, 'Task Estimate Set', taskEstimateProperties)
  }

  // user
  accountCreated = (userId: string, isInvited: boolean, isPatient0: boolean) => {
    this.track(userId, 'Account Created', {
      isInvited,
      // properties below needed for Google Analytics goal setting
      category: 'All',
      label: isPatient0 ? 'isPatient0' : 'isNotPatient0'
    })
  }

  accountPaused = (userId: string) => this.track(userId, 'Account Paused')

  accountUnpaused = (userId: string) => this.track(userId, 'Account Unpaused')

  accountNameChanged = (userId: string, newName: string) =>
    this.track(userId, 'Account Name Changed', {
      newName
    })

  billingLeaderModified = (
    userId: string,
    viewerId: string,
    orgId: string,
    modificationType: 'add' | 'remove'
  ) => {
    this.track(userId, 'Billing Leader Modified', {
      userId,
      viewerId,
      orgId,
      modificationType
    })
  }

  userRemovedFromOrg = (userId: string, orgId: string) =>
    this.track(userId, 'User Removed From Org', {userId, orgId})

  websocketConnected = (userId: string, websocketProperties: WebSocketProperties) => {
    this.track(userId, 'Connect WebSocket', websocketProperties)
  }

  websocketDisconnected = (userId: string, websocketProperties: WebSocketProperties) => {
    this.track(userId, 'Disconnect WebSocket', websocketProperties)
  }

  toggleSubToSummaryEmail = (userId: string, subscribeToSummaryEmail: boolean) => {
    this.track(userId, 'Summary Email Setting Changed', {subscribeToSummaryEmail})
  }

  notificationEmailSent = (userId: string, orgId: string, type: TeamLimitsEmailType) => {
    this.track(userId, 'Notification Email Sent', {type, orgId})
  }

  suggestedGroupsGenerated = (userId: string, meetingId: string, teamId: string) => {
    this.track(userId, 'Suggested Groups Generated', {meetingId, teamId})
  }

  suggestGroupsClicked = (userId: string, meetingId: string, teamId: string) => {
    this.track(userId, 'Suggest Groups Clicked', {meetingId, teamId})
  }

  resetGroupsClicked = (userId: string, meetingId: string, teamId: string) => {
    this.track(userId, 'Reset Groups Clicked', {meetingId, teamId})
  }

  addedAgendaItem = (userId: string, teamId: string, meetingId?: string) => {
    this.track(userId, 'Added Agenda Item', {teamId, meetingId})
  }

  archiveOrganization = (userId: string, orgId: string) => {
    this.track(userId, 'Archive Organization', {orgId})
  }

  enterpriseOverUserLimit = (userId: string, orgId: string) => {
    this.track(userId, 'Enterprise Over User Limit', {orgId})
  }

  newOrg = (userId: string, orgId: string, teamId: string, fromSignup: boolean) => {
    this.track(userId, 'New Org', {orgId, teamId, fromSignup})
  }

  newTeam = (userId: string, orgId: string, teamId: string, teamNumber: number) => {
    this.track(userId, 'New Team', {orgId, teamId, teamNumber})
  }

  identify = (options: IdentifyOptions) => {
    this.amplitudeAnalytics.identify(options)
    this.segmentAnalytics.identify(options)
  }

  private track = (userId: string, event: AnalyticsEvent, properties?: Record<string, any>) => {
    const dataloader = getDataLoader()
    this.amplitudeAnalytics.track(userId, event, dataloader, properties)
    this.segmentAnalytics.track(userId, event, dataloader, properties)
  }
}

export const analytics = new Analytics()
