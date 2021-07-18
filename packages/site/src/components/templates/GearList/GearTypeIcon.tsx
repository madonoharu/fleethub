import React from "react";

import { GearIcon } from "../../molecules";

type Props = {
  type: number;
};

const GearTypeIcon: React.FCX<Props> = ({ className, type }) => {
  return <GearIcon className={className} iconId={1} />;
};

export default GearTypeIcon;
