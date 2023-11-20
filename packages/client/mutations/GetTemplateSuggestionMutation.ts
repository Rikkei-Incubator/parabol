import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {GetTemplateSuggestionMutation as TGetTemplateSuggestionMutation} from '../__generated__/GetTemplateSuggestionMutation.graphql'

graphql`
  fragment GetTemplateSuggestionMutation_viewer on GetTemplateSuggestionSuccess {
    suggestedTemplate {
      id
    }
    explanation
  }
`

const mutation = graphql`
  mutation GetTemplateSuggestionMutation($prompt: String!) {
    getTemplateSuggestion(prompt: $prompt) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...GetTemplateSuggestionMutation_viewer @relay(mask: false)
    }
  }
`

const GetTemplateSuggestionMutation: StandardMutation<TGetTemplateSuggestionMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TGetTemplateSuggestionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default GetTemplateSuggestionMutation
