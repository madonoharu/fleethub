import type {
  Matcher,
  ActionFromMatcher,
  HasMatchFunction,
} from "@reduxjs/toolkit/dist/tsHelpers";

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
    hasMatchFunction: HasMatchFunction<A>
  ) =>
  (action: unknown): action is Exclude<ActionFromMatcher<M>, A> =>
    !hasMatchFunction.match(action) && matches(matcher, action);
