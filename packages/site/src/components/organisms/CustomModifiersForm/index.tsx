import { Path, PathValue } from "@fh/utils";
import BuildIcon from "@mui/icons-material/Build";
import { Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { AttackPowerModifier, CustomModifiers } from "fleethub-core";
import { produce } from "immer";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React from "react";

import { useModal } from "../../../hooks";
import { Divider } from "../../atoms";

import AttackPowerModifierForm from "./AttackPowerModifierForm";

function hasMod(mod: AttackPowerModifier): boolean {
  return mod.a != 1 || mod.b != 0;
}

type CustomModifiersFormProps = {
  value: CustomModifiers;
  onChange?: (value: CustomModifiers) => void;
};

const CustomModifiersForm: React.FCX<CustomModifiersFormProps> = ({
  className,
  style,
  value,
  onChange,
}) => {
  const { t } = useTranslation("common");
  const Modal = useModal();

  const bind =
    <P extends Path<CustomModifiers>>(path: P) =>
    (input: PathValue<CustomModifiers, P>) => {
      const next = produce(value, (draft) => {
        set(draft, path, input);
      });

      onChange?.(next);
    };

  const renderEntry = (entry: [string, AttackPowerModifier]) => {
    const [key, mod] = entry;

    if (!hasMod(mod)) {
      return null;
    }

    return <span key={key}>{`${t(key)} x${mod.a} +${mod.b}`}</span>;
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
        <Stack gap={1} mb={1}>
          <Typography variant="subtitle1">{t("custom_mods")}</Typography>
          <Divider label={t("precap_mod")} />
          <AttackPowerModifierForm
            value={value.precap_mod}
            onChange={bind("precap_mod")}
          />
          <Divider label={t("postcap_mod")} />
          <AttackPowerModifierForm
            value={value.postcap_mod}
            onChange={bind("postcap_mod")}
          />
        </Stack>
      </Modal>
    </div>
  );
};

export default styled(CustomModifiersForm)`
  display: grid;
  grid-template-columns: max-content auto;
  gap: 8px;
`;
