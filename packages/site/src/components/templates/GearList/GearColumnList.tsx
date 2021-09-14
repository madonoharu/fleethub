import styled from "@emotion/styled";
import { Gear, GearType } from "@fh/core";
import { Button, Tooltip, Typography } from "@mui/material";
import React from "react";

import { Divider, Flexbox } from "../../atoms";
import { StatIcon } from "../../molecules";
import { GearNameplate, GearTooltip } from "../../organisms";
import { toStatEntries } from "../../organisms/GearTooltip/GearStatList";

const Margin = styled(Flexbox)`
  margin-left: 8px;
  width: 36px;
  ${StatIcon} {
    margin-right: 4px;
  }
`;

const StatList: React.FC<{ gear: Gear }> = ({ gear }) => {
  const entries = toStatEntries(gear);
  return (
    <Margin>
      {entries.map(({ key, value }) => (
        <Tooltip key={key} title={key}>
          <Margin>
            <StatIcon icon={key} />
            <Typography>{value}</Typography>
          </Margin>
        </Tooltip>
      ))}
    </Margin>
  );
};

const Container = styled.div`
  display: flex;
  width: 100%;
  > * {
    width: 50%;
    max-width: 50%;
  }
`;

let GearButton: React.FCX<{ gear: Gear; onClick?: () => void }> = ({
  className,
  gear,
  onClick,
}) => {
  return (
    <Button className={className} onClick={onClick}>
      <Container>
        <GearTooltip gear={gear}>
          <div>
            <GearNameplate name={gear.name} iconId={gear.icon_id} />
          </div>
        </GearTooltip>
        <StatList gear={gear} />
      </Container>
    </Button>
  );
};

GearButton = styled(GearButton)`
  width: 100%;
  justify-content: flex-start;
`;

type Props = {
  type: GearType;
  gears: Gear[];
  onSelect?: (gearId: number) => void;
};

const GearTypeContainer: React.FCX<Props> = ({
  className,
  type,
  gears,
  onSelect,
}) => {
  return (
    <div className={className}>
      <Divider label={type} />
      {gears.map((gear) => (
        <GearButton
          key={`gear-${gear.gear_id}`}
          gear={gear}
          onClick={() => onSelect && onSelect(gear.gear_id)}
        />
      ))}
    </div>
  );
};

export default styled(GearTypeContainer)``;
