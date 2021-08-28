import { useDebugValue, useEffect, useRef } from "react";

export const useRenderCount = () => {
  const renderCountRef = useRef(0);

  useDebugValue(
    `このコンポーネントは${renderCountRef.current}回再描画されました`
  );

  useEffect(() => {
    renderCountRef.current++;
  });
};

export * from "./useAsyncOnPublish";
export * from "./useDrag";
export * from "./useDragLayerRef";
export * from "./useDrop";
export * from "./useFetch";
export * from "./useFhCore";
export * from "./useFile";
export * from "./useModal";
export * from "./usePopover";
export * from "./useSelectState";
export * from "./useShip";
export * from "./useSnackbar";
export * from "./useSwap";
export * from "./useTimeout";
export * from "./useOrg";
export * from "./useOrgContext";
