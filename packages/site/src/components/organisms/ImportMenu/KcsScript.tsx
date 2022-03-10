import { TextField } from "@mui/material";
import React from "react";

import { CopyTextButton } from "../../molecules";

const KcsScript: React.FC = () => {
  const str = process.env.KCS_SCRIPT;

  return (
    <TextField
      fullWidth
      value={str}
      InputProps={{ endAdornment: <CopyTextButton value={str} /> }}
    />
  );
};

export default KcsScript;
