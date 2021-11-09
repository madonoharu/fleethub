/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { uniq } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Button, Stack } from "@mui/material";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import React from "react";
import { fetchMapVersion, MapVersion } from "../../../firebase";

import { useModal } from "../../../hooks";
import { Divider } from "../../atoms";

type AreaListProps = {
  areas: number[];
  onChange?: (id: number) => void;
};

const AreaList: React.FCX<AreaListProps> = ({ className, areas, onChange }) => {
  const { t } = useTranslation("common");
  const worlds = uniq(areas.map((id) => Math.floor(id / 10)));

  return (
    <div className={className}>
      {worlds.map((world) => (
        <div key={world}>
          <Divider label={t(`worldName${world}`)} />
          {areas
            .filter((id) => Math.floor(id / 10) === world)
            .map((id) => (
              <Button key={id} onClick={() => onChange?.(id)}>
                {world}-{id % 10}
              </Button>
            ))}
        </div>
      ))}
    </div>
  );
};

type AreaMenuProps = {
  all: MapVersion;
  onChange?: (id: number) => void;
};

const AreaMenu: React.FCX<AreaMenuProps> = ({ className, all, onChange }) => {
  const ids = Object.keys(all).map((id) => Number(id));
  const normalAreas = ids.filter((id) => id < 100);
  const eventAreas = ids.filter((id) => id >= 100);

  return (
    <Stack
      className={className}
      flexDirection="row"
      alignItems="flex-start"
      flexWrap="wrap"
      gap={2}
    >
      <AreaList areas={normalAreas} onChange={onChange} />
      <AreaList areas={eventAreas} onChange={onChange} />
    </Stack>
  );
};

const AreaMenuAsync = dynamic(async () => {
  const all = await fetchMapVersion();

  const component: React.FCX<Omit<AreaMenuProps, "all">> = (props) => (
    <AreaMenu all={all} {...props} />
  );

  return component;
});

const StyledButton = styled(Button)`
  height: 40px;
  margin-right: 8px;
  .MuiButton-endIcon {
    font-size: 1.5rem;
  }
`;

type AreaSelectProps = {
  value: number;
  onChange: (value: number) => void;
};

const AreaSelect: React.FCX<AreaSelectProps> = ({ value, onChange }) => {
  const Modal = useModal();

  const handleChange = (value: number) => {
    onChange(value);
    Modal.hide();
  };

  return (
    <>
      <StyledButton
        onClick={Modal.show}
        variant="contained"
        color="primary"
        endIcon={<ArrowDropDownIcon />}
      >
        海域 {value}
      </StyledButton>
      <Modal sx={{ m: 1 }}>
        <AreaMenuAsync onChange={handleChange} />
      </Modal>
    </>
  );
};

export default AreaSelect;
