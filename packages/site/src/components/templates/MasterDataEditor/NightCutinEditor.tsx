import { Typography } from "@mui/material";
import { NightCutinDef } from "fleethub-core";
import set from "lodash/set";
import { useTranslation } from "next-i18next";
import React, { useMemo, useState } from "react";

import { Flexbox } from "../../atoms";
import ValueInput from "../../organisms/MasterShipEditor/ValueInput";

interface NightCutinEditorProps {
  def: NightCutinDef;
}

const NightCutinEditor: React.FC<NightCutinEditorProps> = ({ def }) => {
  const { t } = useTranslation("common");

  const keys = ["power_mod", "accuracy_mod", "chance_denom"] as const;
  return (
    <div>
      <Typography variant="subtitle2">{t(`NightCutin.${def.tag}`)}</Typography>

      <Flexbox gap={1}>
        {keys.map((key) => (
          <div key={key}>
            <Typography variant="subtitle2">{key}</Typography>
            <ValueInput
              defaultValue={def[key]}
              value={def[key]}
              onChange={console.log}
            />
          </div>
        ))}
      </Flexbox>
    </div>
  );
};

export default NightCutinEditor;
