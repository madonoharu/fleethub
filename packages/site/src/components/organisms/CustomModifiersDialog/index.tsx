import BuildIcon from "@mui/icons-material/Build";
import { Button, Stack } from "@mui/material";

import { AttackPowerModifier, CustomPowerModifiers, Ship } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";

import { useAppDispatch, useModal } from "../../../hooks";
import { shipsSlice } from "../../../store";

import CustomPowerModifiersForm, { CUSTOM_POWER_MODIFIERS_KEYS } from "./CustomPowerModifiersForm";
import { cn } from "../../../styles";

function hasMod(mod: AttackPowerModifier | undefined): mod is AttackPowerModifier {
  if (!mod) {
    return false;
  }

  return mod.a != 1 || mod.b != 0;
}

type CustomPowerModifiersDialogProps = {
  ship: Ship;
};

const CustomPowerModifiersDialog: React.FCX<CustomPowerModifiersDialogProps> = ({
  className,
  style,
  ship,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  const mods = ship.custom_power_mods();
  const visibleMods = Object.values(mods).some(hasMod);

  const dispatch = useAppDispatch();

  const handleChange = (value: CustomPowerModifiers) => {
    dispatch(
      shipsSlice.actions.update({
        id: ship.id,
        changes: { custom_power_mods: value },
      }),
    );
  };

  return (
    <div>
      <Button
        className={cn("justify-start", className)}
        style={style}
        variant="outlined"
        startIcon={<BuildIcon />}
        onClick={Modal.show}
      >
        {visibleMods ? (
          <Stack>
            {CUSTOM_POWER_MODIFIERS_KEYS.map((key) => {
              const mod = mods[key];

              if (!hasMod(mod)) {
                return null;
              }

              const label = t(key);

              return <span key={key}>{`${label} x${mod.a ?? "1.0"} +${mod.b ?? "0"}`}</span>;
            })}
          </Stack>
        ) : (
          t("custom_mods")
        )}
      </Button>

      <Modal>
        <CustomPowerModifiersForm value={mods} onChange={handleChange} />
      </Modal>
    </div>
  );
};

export default ({
  className,
  ...props
}: React.ComponentProps<typeof CustomPowerModifiersDialog>) => (
  <CustomPowerModifiersDialog
    {...props}
    className={cn(
      "grid [grid-template-columns:max-content_auto] gap-2 [&_.MuiButton-startIcon]:inline-flex",
      className,
    )}
  />
);
