import { createSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import {
  DefaultRootState,
  shallowEqual,
  useDispatch,
  useSelector,
} from "react-redux";

import {
  appSlice,
  entitiesSlice,
  FileEntity,
  isFolder,
  filesSelectors,
} from "../store";
import { filesSlice as filesSlice2 } from "../store/entities/filesSlice";

const getParents = (files: FileEntity[], id: string): FileEntity[] => {
  const parent = files.find(
    (file) => isFolder(file) && file.children.includes(id)
  );

  if (!parent) return [];

  return [...getParents(files, parent.id), parent];
};

const makeSelectParents = () =>
  createSelector(
    (state: DefaultRootState) => filesSelectors.selectAll(state),
    (state: DefaultRootState, id: string) => id,
    (files, id) => getParents(files, id)
  );

export const useIsTemp = (id: string) =>
  useSelector((root) => {
    const tempIds = root.present.entities.files.tempIds;
    return tempIds.includes(id);
  });

export function useFileActions(id: string) {
  const dispatch = useDispatch();

  const actions = useMemo(() => {
    const filesSlice = filesSlice2;

    const open = () => dispatch(appSlice.actions.openFile(id));
    const update = (changes: Partial<FileEntity>) =>
      dispatch(filesSlice.actions.update({ id, changes }));
    const copy = () => dispatch(entitiesSlice.actions.cloneFile(id));
    const remove = () => dispatch(filesSlice.actions.remove(id));
    const save = () => dispatch(filesSlice.actions.move(id));

    const createFolder = () => dispatch(filesSlice.actions.createFolder(id));

    const drop = (dragFile: FileEntity) =>
      dispatch(filesSlice.actions.move(dragFile.id, id));

    const setName = (name: string) => update({ name });
    const setDescription = (description: string) => update({ description });

    return {
      open,
      update,
      drop,
      copy,
      remove,
      save,
      createPlan: () =>
        dispatch(entitiesSlice.actions.createPlan(undefined, id)),
      createFolder,
      setName,
      setDescription,
    };
  }, [dispatch, id]);

  return actions;
}

export function useFileCanDrop(id: string) {
  const entity = useSelector(
    (root) => root.present.entities.files.entities[id]
  );

  const selectParents = useMemo(makeSelectParents, []);
  const parents = useSelector(
    (state) => selectParents(state, id),
    shallowEqual
  );

  const canDrop = (dragFile: FileEntity) => {
    if (dragFile === entity) return false;

    if (isFolder(entity) && entity.children.includes(dragFile.id)) return false;

    return !parents.includes(dragFile);
  };

  return { parents, canDrop };
}

export const useFile = (id: string) => {
  const file = useSelector((root) => filesSelectors.selectById(root, id));

  const isTemp = useIsTemp(id);

  const actions = useFileActions(id);
  const { canDrop, parents } = useFileCanDrop(id);

  return { file, isTemp, actions, parents, canDrop };
};
