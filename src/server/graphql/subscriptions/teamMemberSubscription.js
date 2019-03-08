import {GraphQLNonNull} from 'graphql'
import makeSubscribeIter from 'server/graphql/makeSubscribeIter'
import TeamMemberSubscriptionPayload from 'server/graphql/types/TeamMemberSubscriptionPayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import {TEAM_MEMBER} from 'universal/utils/constants'
import standardError from 'server/utils/standardError'

export default {
  type: new GraphQLNonNull(TeamMemberSubscriptionPayload),
  subscribe: async (source, args, {authToken, socketId, dataLoader}) => {
    // AUTH
    if (!isAuthenticated(authToken)) {
      return standardError(new Error('Not authenticated'))
    }

    // RESOLUTION
    const userId = getUserId(authToken)
    const {tms: teamIds} = authToken
    const channelNames = teamIds.concat(userId).map((id) => `${TEAM_MEMBER}.${id}`)
    const filterFn = (value) => value.mutatorId !== socketId
    const resolve = ({data}) => ({teamMemberSubscription: data})
    return makeSubscribeIter(channelNames, {filterFn, dataLoader, resolve})
  }
}
