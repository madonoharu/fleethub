import BuildIcon from "@mui/icons-material/Build";
import { Button, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { AttackPowerModifier, CustomModifiers } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";

import CustomModifiersForm from "./CustomModifiersForm";

function hasMod(mod: AttackPowerModifier): boolean {
  return mod.a != 1 || mod.b != 0;
}

type CustomModifiersDialogProps = {
  value: CustomModifiers;
  onChange?: (value: CustomModifiers) => void;
};

const CustomModifiersDialog: React.FCX<CustomModifiersDialogProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  const renderEntry = (entry: [string, AttackPowerModifier]) => {
    const [key, mod] = entry;

    if (!hasMod(mod)) {
      return null;
    }

    const label = t(key as keyof CustomModifiers);

    return <span key={key}>{`${label} x${mod.a} +${mod.b}`}</span>;
  };

  const visibleMods = Object.values(value).some(hasMod);

  return (
    <div>
      <Button
        className={className}
        style={style}
        variant="outlined"
        startIcon={<BuildIcon />}
        onClick={Modal.show}
        sx={{ justifyContent: "flex-start" }}
      >
        {visibleMods ? (
          <Stack>{Object.entries(value).map(renderEntry)}</Stack>
        ) : (
          t("custom_mods")
        )}
      </Button>

      <Modal>
        <CustomModifiersForm value={value} onChange={onChange} />
      </Modal>
    </div>
  );
};

export default styled(CustomModifiersDialog)`
  display: grid;
  grid-template-columns: max-content auto;
  gap: 8px;
`;
