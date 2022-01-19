/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { nonNullable } from "@fh/utils";
import { createCachedSelector, LruMapCache } from "re-reselect";
import { shallowEqual } from "react-redux";
import { createSelectorCreator, defaultMemoize } from "reselect";
import {
  isObject,
  isEntitySchema,
  isEntityId,
  denormalize,
  AnySchema,
  Entities,
  EntityId,
  NormalizedSchemaResult,
  Schema,
  AnyEntitySchema,
} from "ts-norm";

function getAffectedEntitiesImpl(
  input: unknown,
  schema: AnySchema,
  entities: Entities,
  setEntity: (
    id: EntityId,
    entity: object | undefined,
    schema: AnyEntitySchema
  ) => void
): void {
  if (isEntitySchema(schema)) {
    if (!isEntityId(input)) {
      return;
    }

    const key = schema.key;
    const entity = entities[key]?.[input] as
      | Record<string, unknown>
      | undefined;

    setEntity(input, entity, schema);

    if (isObject(entity)) {
      schema.definitionEntries().forEach(([key, localSchema]) => {
        const v = entity[key];
        getAffectedEntitiesImpl(v, localSchema, entities, setEntity);
      });
    }
  } else if (Array.isArray(schema)) {
    if (!Array.isArray(input)) {
      return;
    }

    const localSchema = schema[0];

    input.forEach((item) => {
      getAffectedEntitiesImpl(item, localSchema, entities, setEntity);
    });
  } else {
    if (!isObject(input)) {
      return;
    }

    Object.entries(schema).forEach(([key, localSchema]) => {
      if (localSchema) {
        const v = (input as Record<string, unknown>)[key];
        getAffectedEntitiesImpl(v, localSchema, entities, setEntity);
      }
    });
  }
}

export function getAffectedEntities(
  input: unknown,
  schema: AnySchema,
  entities: Entities
): Entities {
  const result: Entities = {};

  getAffectedEntitiesImpl(input, schema, entities, (id, entity, schema) => {
    const key = schema.key;
    const dict = (result[key] ||= {});
    dict[id] = entity;
  });

  return result;
}

function cloneAffectedEntitiesImpl<T>(
  input: T,
  schema: AnySchema,
  entities: Entities,
  cloned: Entities,
  idGenerator: () => string
): T {
  if (isEntitySchema(schema)) {
    if (!isEntityId(input)) {
      return input;
    }

    const key = schema.key;
    const entity = entities[key]?.[input] as
      | Record<string, unknown>
      | undefined;

    const nextId = idGenerator();

    const clonedEntity = cloneAffectedEntitiesImpl(
      entity,
      schema.definition,
      entities,
      cloned,
      idGenerator
    );

    if (clonedEntity) {
      clonedEntity[schema.idAttribute] = nextId;
      const dict = (cloned[key] ||= {});
      dict[nextId] = clonedEntity;
    }

    return nextId as unknown as T;
  } else if (Array.isArray(schema)) {
    if (!Array.isArray(input)) {
      return input;
    }

    const localSchema = schema[0];

    return input.map((item) =>
      cloneAffectedEntitiesImpl(
        item,
        localSchema,
        entities,
        cloned,
        idGenerator
      )
    ) as unknown as T;
  } else {
    if (!isObject(input)) {
      return input;
    }

    const result = {} as T;
    const keys = Object.keys(input) as (keyof T)[];
    keys.forEach((key) => {
      const value = input[key];
      const localSchema = schema[key as string];

      if (localSchema) {
        result[key] = cloneAffectedEntitiesImpl(
          value,
          localSchema,
          entities,
          cloned,
          idGenerator
        );
      } else {
        result[key] = value;
      }
    });

    return result;
  }
}

export function cloneAffectedEntities<T>(
  input: T,
  schema: AnySchema,
  entities: Entities,
  idGenerator: () => string
): {
  result: T;
  entities: Entities;
} {
  const cloned: Entities = {};
  const result = cloneAffectedEntitiesImpl(
    input,
    schema,
    entities,
    cloned,
    idGenerator
  );

  return {
    result,
    entities: cloned,
  };
}

type SchemaInputType<S extends AnySchema> = S extends Schema<infer T>
  ? T
  : never;
type DenormalizeInput<S extends AnySchema> = NormalizedSchemaResult<
  SchemaInputType<S>,
  S
>;

type DenormalizeSelector<T, S extends AnySchema> = (
  state: T,
  input: DenormalizeInput<S>
) => SchemaInputType<S> | undefined;

export function getEntitySchemata(
  schema: AnySchema,
  result: AnyEntitySchema[] = []
) {
  if (isEntitySchema(schema)) {
    if (result.includes(schema)) {
      return result;
    }

    result.push(schema);
    getEntitySchemata(schema.definition, result);
  } else {
    Object.values(schema)
      .filter(nonNullable)
      .forEach((value) => {
        getEntitySchemata(value, result);
      });
  }

  return result;
}

export function createDenormalizeSelector<T, S extends AnySchema>(
  schema: S,
  entitiesSelector: (state: T) => Entities
): DenormalizeSelector<T, S> {
  type Args = [DenormalizeInput<S>, Entities];

  const keys = getEntitySchemata(schema).map((schema) => schema.key);

  const equalityCheck = (
    [_, prevEntities]: Args,
    [nextInput, nextEntities]: Args
  ) => {
    if (
      prevEntities === nextEntities ||
      keys.every((key) => shallowEqual(prevEntities[key], nextEntities[key]))
    ) {
      return true;
    }

    const affected = getAffectedEntities(nextInput, schema, nextEntities);

    return keys.every((key) => shallowEqual(prevEntities[key], affected[key]));
  };

  const selectorCreator = createSelectorCreator(defaultMemoize, equalityCheck);

  return createCachedSelector(
    (state: T, input: DenormalizeInput<S>): Args => [
      input,
      entitiesSelector(state),
    ],
    ([input, entities]) => {
      return denormalize(input, schema, entities as never);
    }
  )({
    keySelector: (state, input) => input,
    selectorCreator,
    cacheObject: new LruMapCache({ cacheSize: 1000 }),
  });
}
