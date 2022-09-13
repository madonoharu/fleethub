import { uniq } from "@fh/utils";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  styled,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import React, { useContext } from "react";

import { GenerationMapContext, useModal } from "../../../hooks";
import { Divider } from "../../atoms";

interface WorldAreaButtonsProps extends AreaListProps {
  world: number;
}

const WorldAreaButtons: React.FCX<WorldAreaButtonsProps> = ({
  world,
  areas,
  onClick,
}) => {
  const { t } = useTranslation("common");

  return (
    <div>
      <Divider label={t(`worldName.${world as 1}`)} />
      {areas
        .filter((id) => Math.floor(id / 10) === world)
        .map((id) => (
          <Button
            key={id}
            component="button"
            value={id.toString()}
            onClick={onClick}
          >
            {world}-{id % 10}
          </Button>
        ))}
    </div>
  );
};

interface AreaListProps {
  areas: number[];
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const EventAreaList: React.FCX<AreaListProps> = ({
  className,
  areas,
  onClick,
}) => {
  const worlds = uniq(areas.map((id) => Math.floor(id / 10))).reverse();

  if (worlds.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <WorldAreaButtons world={worlds[0]} areas={areas} onClick={onClick} />
      <Accordion css={{ borderRadius: 4, overflow: "hidden" }} disableGutters>
        <AccordionSummary>Past Events</AccordionSummary>
        <AccordionDetails sx={{ maxHeight: 256, overflowY: "scroll" }}>
          {worlds.map((world) => (
            <WorldAreaButtons
              key={world}
              world={world}
              areas={areas}
              onClick={onClick}
            />
          ))}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

const AreaList: React.FCX<AreaListProps> = ({ className, areas, onClick }) => {
  const worlds = uniq(areas.map((id) => Math.floor(id / 10)));

  return (
    <div className={className}>
      {worlds.map((world) => (
        <WorldAreaButtons
          key={world}
          world={world}
          areas={areas}
          onClick={onClick}
        />
      ))}
    </div>
  );
};

type AreaMenuProps = {
  onChange?: (id: number) => void;
};

const AreaMenu: React.FCX<AreaMenuProps> = ({ className, onChange }) => {
  const generationMap = useContext(GenerationMapContext);

  const ids = Object.keys(generationMap)
    .map((key) => {
      const str = key.replace(/data\/maps\/(\d+)\.json/, (_, id: string) => id);
      return Number(str);
    })
    .filter((id) => !Number.isNaN(id));

  const normalAreas = ids.filter((id) => id < 100);
  const eventAreas = ids.filter((id) => id >= 100);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onChange?.(Number(event.currentTarget.value));
  };

  return (
    <Stack
      className={className}
      flexDirection="row"
      alignItems="flex-start"
      flexWrap="wrap"
      gap={2}
    >
      <AreaList areas={normalAreas} onClick={handleClick} />
      <EventAreaList areas={eventAreas} onClick={handleClick} />
    </Stack>
  );
};

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
  const { t } = useTranslation("common");
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
        {t("Map")} {Math.floor(value / 10)}-{value % 10}
      </StyledButton>
      <Modal sx={{ m: 1 }}>
        <AreaMenu onChange={handleChange} />
      </Modal>
    </>
  );
};

export default AreaSelect;
