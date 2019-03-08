import {TemplatePromptItem_prompt} from '__generated__/TemplatePromptItem_prompt.graphql'
import React, {Component} from 'react'
import {DraggableProvided} from 'react-beautiful-dnd'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveReflectTemplatePromptMutation from 'universal/mutations/RemoveReflectTemplatePromptMutation'
import {PALETTE} from 'universal/styles/paletteV2'
import {typeScale} from 'universal/styles/theme/typography'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import EditableTemplatePrompt from './EditableTemplatePrompt'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

interface PassedProps {
  canRemove: boolean
  isDragging: boolean
  prompt: TemplatePromptItem_prompt
  prompts: any
  dragProvided: DraggableProvided
}

interface Props extends WithAtmosphereProps, WithMutationProps, PassedProps {}

interface State {
  isHover: boolean
}

interface StyledProps {
  isDragging: boolean
  isHover: boolean
}

const lineHeight = '2.75rem'

const PromptItem = styled('li')(({isHover, isDragging}: StyledProps) => ({
  alignItems: 'flex-start',
  backgroundColor: isHover || isDragging ? PALETTE.BACKGROUND.MAIN_LIGHTENED : undefined,
  borderRadius: '.125rem',
  display: 'flex',
  fontSize: typeScale[5],
  lineHeight,
  padding: '0 .6875rem 0 1rem'
}))

const RemovePromptIcon = styled(Icon)(({isHover}: StyledProps) => ({
  color: PALETTE.TEXT.LIGHT,
  cursor: 'pointer',
  display: 'block',
  fontSize: MD_ICONS_SIZE_18,
  lineHeight,
  marginLeft: 'auto',
  opacity: isHover ? 1 : 0
}))

class TemplatePromptItem extends Component<Props, State> {
  state = {
    isHover: false
  }
  onMouseEnter = () => {
    this.setState({
      isHover: true
    })
  }

  onMouseLeave = () => {
    this.setState({
      isHover: false
    })
  }

  removePrompt = () => {
    const {
      onError,
      onCompleted,
      submitting,
      submitMutation,
      atmosphere,
      prompt,
      prompts
    } = this.props
    if (submitting) return
    if (prompts.length <= 1) {
      onError('You must have at least 1 prompt')
      return
    }
    submitMutation()
    RemoveReflectTemplatePromptMutation(atmosphere, {promptId: prompt.id}, {}, onError, onCompleted)
  }

  render() {
    const {canRemove, dragProvided, isDragging, prompt, prompts} = this.props
    const {id: promptId, question} = prompt
    const {isHover} = this.state
    return (
      <PromptItem
        innerRef={dragProvided.innerRef}
        {...dragProvided.dragHandleProps}
        {...dragProvided.draggableProps}
        isDragging={isDragging}
        isHover={isHover}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <EditableTemplatePrompt
          isHover={isHover}
          question={question}
          promptId={promptId}
          prompts={prompts}
        />
        {canRemove && (
          <RemovePromptIcon isHover={isHover} onClick={this.removePrompt}>
            cancel
          </RemovePromptIcon>
        )}
      </PromptItem>
    )
  }
}

export default createFragmentContainer<PassedProps>(
  withAtmosphere(withMutationProps(TemplatePromptItem)),
  graphql`
    fragment TemplatePromptItem_prompt on RetroPhaseItem {
      id
      question
    }
  `
)
