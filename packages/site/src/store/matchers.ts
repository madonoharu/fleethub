export interface TypeGuard<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (value: any): value is T;
}

export interface HasMatchFunction<T> {
  match: TypeGuard<T>;
}

export type Matcher<T> = HasMatchFunction<T> | TypeGuard<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionFromMatcher<M extends Matcher<any>> =
  M extends Matcher<infer T> ? T : never;

const hasMatchFunction = <T>(v: Matcher<T>): v is HasMatchFunction<T> => {
  return v && typeof (v as HasMatchFunction<T>).match === "function";
};

const matches = (matcher: Matcher<unknown>, action: unknown) => {
  if (hasMatchFunction(matcher)) {
    return matcher.match(action);
  } else {
    return matcher(action);
  }
};

export const exclude =
  <M extends Matcher<unknown>, A>(
    matcher: M,
    hasMatchFunction: HasMatchFunction<A>,
  ) =>
  (action: unknown): action is Exclude<ActionFromMatcher<M>, A> =>
    !hasMatchFunction.match(action) && matches(matcher, action);
