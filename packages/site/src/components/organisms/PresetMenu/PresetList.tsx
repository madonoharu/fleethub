/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import CheckIcon from "@mui/icons-material/Check";
import { Button, Stack } from "@mui/material";
import React from "react";

import { Preset } from "../../../store";
import { Flexbox } from "../../atoms";

import PresetCard from "./PresetCard";

const StyledButton = styled(Button)`
  height: 100%;
  width: 100%;
  justify-content: flex-start;
`;

type PresetListItemProps = {
  preset: Preset;
  selected?: boolean;
  equippable?: boolean;
  onSelect: () => void;
  onEquip: (preset: Preset) => void;
};

const PresetListItem: React.FCX<PresetListItemProps> = ({
  preset,
  selected,
  equippable,
  onSelect,
  onEquip,
}) => {
  const handleEquip = () => {
    onEquip(preset);
  };

  const color = equippable === false ? "error" : "primary";

  return (
    <Flexbox gap={1}>
      <StyledButton
        variant={selected ? "contained" : "outlined"}
        color={selected ? color : "inherit"}
        onClick={onSelect}
      >
        {preset.name || ""}
      </StyledButton>

      <Button variant="contained" color={color} onClick={handleEquip}>
        <CheckIcon />
      </Button>
    </Flexbox>
  );
};

type PresetListProps = {
  presets: Preset[];
  onEquip: (preset: Preset) => void;
  canEquip?: (preset: Preset) => boolean;
  allVisible?: boolean;
};

const PresetList: React.FCX<PresetListProps> = ({
  className,
  presets,
  onEquip,
  canEquip,
  allVisible,
}) => {
  const [index, setIndex] = React.useState(0);

  const equippablePresets = canEquip ? presets.filter(canEquip) : presets;
  const visiblePresets = allVisible ? presets : equippablePresets;

  const current = visiblePresets.at(index);

  return (
    <div className={className}>
      <Stack overflow="scroll" height={400} gap={1}>
        {visiblePresets.map((item, i) => (
          <PresetListItem
            key={item.id}
            preset={item}
            selected={index === i}
            equippable={equippablePresets.includes(item)}
            onSelect={() => setIndex(i)}
            onEquip={onEquip}
          />
        ))}
      </Stack>

      {current && <PresetCard preset={current} />}
    </div>
  );
};

export default styled(PresetList)`
  display: flex;
  width: 800px;
  gap: 8px;

  > * {
    flex-basis: 50%;
  }
`;
