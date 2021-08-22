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
  cloneFile,
  createPlan,
  FileEntity,
  filesSelectors,
  filesSlice,
  isFolder,
  selectTempIds,
} from "../store";

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
    const tempIds = selectTempIds(root);
    return tempIds.includes(id);
  });

export const useFile = (id: string) => {
  const file = useSelector((root) => filesSelectors.selectById(root, id));

  const isTemp = useIsTemp(id);

  const selectParents = useMemo(makeSelectParents, []);
  const parents = useSelector(
    (state) => selectParents(state, id),
    shallowEqual
  );

  const dispatch = useDispatch();

  const actions = useMemo(() => {
    const open = () => dispatch(appSlice.actions.openFile(id));
    const update = (changes: Partial<FileEntity>) =>
      dispatch(filesSlice.actions.update({ id, changes }));
    const copy = () => dispatch(cloneFile(id));
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
      createPlan: () => dispatch(createPlan({ to: id })),
      createFolder,
      setName,
      setDescription,
    };
  }, [dispatch, id]);

  const canDrop = (dragFile: FileEntity) => {
    if (dragFile === file) return false;

    if (isFolder(file) && file.children.includes(dragFile.id)) return false;

    return !parents.includes(dragFile);
  };

  return { file, isTemp, actions, parents, canDrop };
};
