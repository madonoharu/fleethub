/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

import { Flexbox } from "../../atoms";
import { GearIcon } from "../../molecules";

const StyledGearIcon = styled(GearIcon)`
  flex-shrink: 0;
  margin-right: 4px;
`;

type Props = {
  className?: string;
  name: string;
  iconId: number;
  wrap?: boolean;
  equippable?: boolean;
};

export const GearNameplate = React.forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const { className, name, iconId, wrap } = props;
    const { t } = useTranslation("gears");
    return (
      <Flexbox ref={ref} className={className}>
        <StyledGearIcon iconId={iconId} />
        <Typography variant="body2" align="left" noWrap={!wrap}>
          {t(name)}
        </Typography>
      </Flexbox>
    );
  }
);

GearNameplate.defaultProps = {
  equippable: true,
};

export default styled(GearNameplate)(
  ({ equippable, theme }) => css`
    max-width: 100%;
    color: ${!equippable && theme.palette.error.light};

    p {
      font-size: 0.75rem;
      line-height: 1.66;
    }
  `
);
