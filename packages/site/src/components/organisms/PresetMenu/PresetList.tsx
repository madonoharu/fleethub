import CheckIcon from "@mui/icons-material/Check";
import { Button } from "@mui/material";
import React from "react";

import { cn } from "../../../styles/cn";
import { Preset } from "../../../store";
import { Flexbox } from "../../atoms";

import PresetCard from "./PresetCard";

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
    <Flexbox className="gap-2">
      <Button
        className="h-full w-full justify-start"
        variant={selected ? "contained" : "outlined"}
        color={selected ? color : "inherit"}
        onClick={onSelect}
      >
        {preset.name || ""}
      </Button>

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
  const [selectedId, setSelectedId] = React.useState<string>();

  const equippablePresets = canEquip ? presets.filter(canEquip) : presets;
  const visiblePresets = allVisible ? presets : equippablePresets;

  const current = visiblePresets.find((preset) => preset.id === selectedId) ?? visiblePresets[0];

  return (
    <div className={cn("flex w-[800px] gap-2 [&>*]:basis-1/2", className)}>
      <div className="flex h-[400px] flex-col gap-2 overflow-scroll">
        {visiblePresets.map((item) => (
          <PresetListItem
            key={item.id}
            preset={item}
            selected={current?.id === item.id}
            equippable={equippablePresets.includes(item)}
            onSelect={() => setSelectedId(item.id)}
            onEquip={onEquip}
          />
        ))}
      </div>

      {current && <PresetCard preset={current} />}
    </div>
  );
};

export default PresetList;
