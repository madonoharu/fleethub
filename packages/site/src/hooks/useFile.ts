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
  copyFile,
  FileEntity,
  filesSelectors,
  filesSlice,
  isDirectory,
  removeFile,
  selectTempIds,
} from "../store";

const getParents = (files: FileEntity[], id: string): FileEntity[] => {
  const parent = files.find(
    (file) => isDirectory(file) && file.children.includes(id)
  );

  if (!parent) return [];

  return [...getParents(files, parent.id), parent];
};

const makeSelectParents = () =>
  createSelector(
    (state: DefaultRootState, id: string) => filesSelectors.selectAll(state),
    (state, id) => id,
    (files, id) => getParents(files, id)
  );

export const useFile = (id: string) => {
  const file = useSelector((state) => filesSelectors.selectById(state, id));
  const isTemp = useSelector((state) => selectTempIds(state).includes(id));

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
    const copy = () => dispatch(copyFile(id));
    const remove = () => dispatch(removeFile(id));
    const save = () => dispatch(filesSlice.actions.move({ id, to: "root" }));

    const createPlan = () =>
      dispatch(filesSlice.actions.createPlan({ to: id }));
    const createFolder = () => dispatch(filesSlice.actions.createFolder(id));

    const drop = (dragFile: FileEntity) =>
      dispatch(filesSlice.actions.move({ id: dragFile.id, to: id }));

    const setName = (name: string) => update({ name });
    const setDescription = (description: string) => update({ description });

    return {
      open,
      update,
      drop,
      copy,
      remove,
      save,
      createPlan,
      createFolder,
      setName,
      setDescription,
    };
  }, [dispatch, id]);

  const canDrop = (dragFile: FileEntity) => {
    if (dragFile === file) return false;

    if (isDirectory(file) && file.children.includes(dragFile.id)) return false;

    return !parents.includes(dragFile);
  };

  return { file, isTemp, actions, parents, canDrop };
};
