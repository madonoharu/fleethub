import { Org } from "@fh/core";
import { Alert } from "@mui/material";
import React from "react";

type Prosp = {
  org: Org;
};

const MiscScreen: React.FC<Prosp> = () => {
  return (
    <div>
      <Alert severity="info">未実装 なに表示する？</Alert>
    </div>
  );
};

export default MiscScreen;
