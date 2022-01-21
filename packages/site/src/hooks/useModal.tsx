import { nanoid } from "@reduxjs/toolkit";
import React, { useCallback, useMemo, useState } from "react";

import { Dialog, DialogProps } from "../components/organisms";
import { batchGroupBy } from "../store";

export const useModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const { show, hide } = useMemo(() => {
    const id = nanoid();

    const show = () => {
      setIsOpen(true);
      batchGroupBy.start(id);
    };

    const hide = () => {
      setIsOpen(false);
      batchGroupBy.end(id);
    };

    return { show, hide };
  }, []);

  const Modal: React.FC<DialogProps> = useCallback(
    (props) => <Dialog open={isOpen} onClose={hide} {...props} />,
    [isOpen, hide]
  );

  return Object.assign(Modal, {
    isOpen,
    show,
    hide,
  });
};
