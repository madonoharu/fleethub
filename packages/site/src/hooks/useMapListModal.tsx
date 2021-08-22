import React, { useCallback } from "react";
import { MapList } from "../components/templates";
import { useModal } from "./useModal";

const useMapListModal = () => {
  const Modal = useModal();
  const { isOpen, show, hide } = Modal;

  const MapListModal: React.FC = useCallback(
    (props) => {
      return (
        <Modal>
          <MapList />
        </Modal>
      );
    },
    [Modal]
  );

  return Object.assign(MapListModal, { isOpen, show, hide });
};
