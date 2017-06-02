import {EditorState, Modifier} from 'draft-js';
import makeRemoveLink from 'universal/components/ProjectEditor/operations/makeRemoveLink';


const makeAddLink = (block, anchorOffset, focusOffset, url) => (editorState) => {
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState
    .createEntity('LINK', 'MUTABLE', {url});
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const selectionState = editorState.getSelection();
  const linkSelectionState = selectionState.merge({
    anchorKey: block,
    focusKey: block,
    anchorOffset,
    focusOffset
  });
  const contentWithUrl = Modifier.applyEntity(
    contentState,
    linkSelectionState,
    entityKey
  ).merge({
    selectionAfter: selectionState,
    selectionBefore: selectionState
  });
  return {
    editorState: EditorState.push(editorState, contentWithUrl, 'apply-link'),
    undoLinkify: makeRemoveLink(block, anchorOffset, focusOffset)
  };
};

export default makeAddLink;