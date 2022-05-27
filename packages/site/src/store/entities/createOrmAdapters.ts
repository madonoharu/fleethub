/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createEntityAdapter,
  EntityState,
  createNextState,
  isDraft,
  EntityAdapter,
} from "@reduxjs/toolkit";
import {
  AnyEntitySchema,
  Entities,
  EntitySchema,
  EntityType,
  UnionToIntersection,
  EntityId,
} from "ts-norm";

type OrmState<T extends AnyEntitySchema[]> = UnionToIntersection<
  T extends (infer E)[]
    ? E extends EntitySchema<any, infer Key, any, any, any>
      ? Record<Key, EntityState<EntityType<E & AnyEntitySchema>>>
      : never
    : never
>;

type EntitiesState<T extends Record<string, AnyEntitySchema>> = {
  [P in keyof T]: EntityState<EntityType<T[P]>>;
};

export type OrmAdapter<T extends AnyEntitySchema[]> = UnionToIntersection<
  T extends (infer E)[]
    ? E extends EntitySchema<any, infer Key, any, any, any>
      ? Record<Key, EntityAdapter<EntityType<E>>>
      : never
    : never
> & {
  setEntities(state: OrmState<T>, entities: Entities): OrmState<T>;
};

export function createStateOperator<
  V extends Record<string, AnyEntitySchema>,
  R
>(mutator: (arg: R, state: EntitiesState<V>) => void) {
  return function operation<S extends EntitiesState<V>>(state: S, arg: R): S {
    const runMutator = (draft: EntitiesState<V>) => {
      mutator(arg, draft);
    };

    if (isDraft(state)) {
      runMutator(state);
      return state;
    } else {
      return createNextState(state, runMutator);
    }
  };
}

export function createOrmAdapters<T extends AnyEntitySchema[]>(
  ...args: T
): OrmAdapter<T> {
  const entityAdapters: Record<string, EntityAdapter<unknown> | undefined> = {};

  args.forEach((schema) => {
    const { key, idAttribute } = schema;

    const selectId = (entity: unknown) => {
      const id = (entity as Record<string, unknown>)[idAttribute];
      return id as EntityId;
    };

    entityAdapters[key] = createEntityAdapter({ selectId });
  });

  const setEntities = (
    state: Record<string, EntityState<unknown>>,
    entities: Entities
  ) => {
    Object.entries(entities).forEach(([key, dict]) => {
      const entityAdapter = entityAdapters[key];
      const entityState = state[key];

      if (entityAdapter) {
        entityAdapter.addMany(entityState, dict);
      }
    });
  };

  return {
    setEntities,
    ...entityAdapters,
  } as unknown as OrmAdapter<T>;
}
