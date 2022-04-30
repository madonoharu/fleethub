import { Typography } from "@mui/material";
import { NightCutinDef } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { useAppDispatch } from "../../../hooks";
import { configSlice, NightCutinOverrides } from "../../../store";
import { Flexbox } from "../../atoms";
import ResettableInput from "../../organisms/ResettableInput";

interface NightCutinFormProps {
  source: NightCutinDef;
  overrides: NightCutinOverrides;
}

const KEYS = ["power_mod", "accuracy_mod", "chance_denom"] as const;

const NightCutinForm: React.FC<NightCutinFormProps> = ({
  source,
  overrides,
}) => {
  const { t } = useTranslation("common");
  const dispatch = useAppDispatch();

  return (
    <div>
      <Typography variant="subtitle1" mb={1}>
        {t(`NightCutin.${source.tag}`)}
      </Typography>

      <Flexbox gap={1} alignItems="flex-end">
        {KEYS.map((key) => (
          <ResettableInput
            key={key}
            label={t(key)}
            defaultValue={source[key]}
            value={overrides[key] ?? null}
            min={0}
            step={key === "chance_denom" ? 1 : 0.1}
            onChange={(v) => {
              dispatch(
                configSlice.actions.updateNightCutinOverrides({
                  id: source.tag,
                  changes: { [key]: v },
                })
              );
            }}
          />
        ))}
      </Flexbox>
    </div>
  );
};

export default NightCutinForm;
