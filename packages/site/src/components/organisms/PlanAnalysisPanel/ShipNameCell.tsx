import { Typography } from "@material-ui/core";
import React from "react";

import { ShipBanner } from "../../molecules";

type Props = {
  name: string;
  banner?: string;
};

const ShipNameCell: React.FCX<Props> = ({ className, name, banner }) => {
  return (
    <div className={className}>
      <Typography variant="caption" display="block">
        {name}
      </Typography>
      <ShipBanner publicId={banner} />
    </div>
  );
};

export default ShipNameCell;
