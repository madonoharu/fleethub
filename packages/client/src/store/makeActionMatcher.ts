import { AnyAction, ActionCreatorWithPayload, PayloadAction } from "@reduxjs/toolkit"

export const makeActionMatcher = <P>(...creators: Array<ActionCreatorWithPayload<P>>) => (
  action: AnyAction
): action is PayloadAction<P> => creators.some((creator) => creator.type === action.type)
