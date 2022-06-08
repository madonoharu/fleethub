import BuildIcon from "@mui/icons-material/Build";
import { Button, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { AttackPowerModifier, CustomModifiers } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";

import CustomModifiersForm from "./CustomModifiersForm";

const KEYS = ["basic_power_mod", "precap_mod", "postcap_mod"] as const;

function hasMod(
  mod: AttackPowerModifier | undefined
): mod is AttackPowerModifier {
  if (!mod) {
    return false;
  }

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
          <Stack>
            {KEYS.map((key) => {
              const mod = value[key];

              if (!hasMod(mod)) {
                return null;
              }

              const label = t(key as keyof CustomModifiers);

              return <span key={key}>{`${label} x${mod.a} +${mod.b}`}</span>;
            })}
          </Stack>
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
