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
    const { name, iconId, wrap, ...rest } = props;
    const { t, i18n } = useTranslation("gears");

    let displayName: string;
    if (i18n.resolvedLanguage === "ja") {
      displayName = name;
    } else {
      displayName = t(name);
    }

    return (
      <Flexbox ref={ref} {...rest}>
        <StyledGearIcon iconId={iconId} />
        <Typography variant="body2" align="left" noWrap={!wrap}>
          {displayName}
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
