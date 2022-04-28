import { Typography } from "@mui/material";
import { NightCutinDef } from "fleethub-core";
import { useTranslation } from "next-i18next";
import React from "react";

import { NightCutinOverrides } from "../../../store";
import { Flexbox } from "../../atoms";
import { RestartAltButton } from "../../molecules";

import ValueInput from "./ValueInput";

interface NightCutinFormProps {
  source: NightCutinDef;
  overrides: NightCutinOverrides;
  onChange: (value: NightCutinOverrides) => void;
}

const KEYS = ["power_mod", "accuracy_mod", "chance_denom"] as const;

const NightCutinForm: React.FC<NightCutinFormProps> = ({
  source,
  overrides,
  onChange,
}) => {
  const { t } = useTranslation("common");

  const handleReset = () => {
    onChange({});
  };

  return (
    <div>
      <Typography variant="subtitle1">
        {t(`NightCutin.${source.tag}`)}
      </Typography>

      <Flexbox gap={1} alignItems="flex-end">
        {KEYS.map((key) => (
          <div key={key}>
            <Typography variant="subtitle2">{t(key)}</Typography>
            <ValueInput
              defaultValue={source[key]}
              value={overrides[key] ?? null}
              min={0}
              step={key === "chance_denom" ? 1 : 0.1}
              onChange={(v) => {
                onChange({ ...overrides, [key]: v });
              }}
            />
          </div>
        ))}

        <RestartAltButton onClick={handleReset} />
      </Flexbox>
    </div>
  );
};

export default NightCutinForm;
