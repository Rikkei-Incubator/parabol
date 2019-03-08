import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import PromoteToTeamLeadPayload from 'server/graphql/types/PromoteToTeamLeadPayload'
import {getUserId, isTeamLead} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import standardError from 'server/utils/standardError'

export default {
  type: PromoteToTeamLeadPayload,
  description: 'Promote another team member to be the leader',
  args: {
    teamMemberId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the new team member that will be the leader'
    }
  },
  async resolve(source, {teamMemberId}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}

    // AUTH
    const viewerId = getUserId(authToken)
    const {teamId} = fromTeamMemberId(teamMemberId)
    const myTeamMemberId = toTeamMemberId(teamId, viewerId)
    if (!(await isTeamLead(viewerId, teamId))) {
      return standardError(new Error('Not team lead'), {userId: viewerId})
    }

    // VALIDATION
    const promoteeOnTeam = await r.table('TeamMember').get(teamMemberId)
    if (!promoteeOnTeam || !promoteeOnTeam.isNotRemoved) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // RESOLUTION
    await r({
      teamLead: r
        .table('TeamMember')
        .get(myTeamMemberId)
        .update({
          isLead: false
        }),
      promotee: r
        .table('TeamMember')
        .get(teamMemberId)
        .update({
          isLead: true
        })
    })

    const data = {teamId, oldLeaderId: myTeamMemberId, newLeaderId: teamMemberId}
    publish(TEAM, teamId, PromoteToTeamLeadPayload, data, subOptions)
    return data
  }
}
