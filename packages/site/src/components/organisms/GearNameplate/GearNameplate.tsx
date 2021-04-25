import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Typography } from "@material-ui/core";
import React from "react";
import { useTranslation } from "react-i18next";

import { Flexbox } from "../../atoms";
import { GearIcon } from "../../molecules";

type Props = {
  className?: string;
  name: string;
  iconId: number;
  size?: "small";
  wrap?: boolean;
  equippable?: boolean;
};

export const GearNameplate = React.forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    const { className, name, iconId, wrap } = props;
    const { t } = useTranslation("gears");
    return (
      <Flexbox ref={ref} className={className}>
        <GearIcon iconId={iconId} />
        <Typography variant="body2" align="left" noWrap={!wrap}>
          {t(name)}
        </Typography>
      </Flexbox>
    );
  }
);

const smallText = css`
  font-size: 0.75rem;
  line-height: 1.66;
`;

GearNameplate.defaultProps = {
  equippable: true,
};

export default styled(GearNameplate)(
  ({ size, equippable, theme }) => css`
    max-width: 100%;

    color: ${!equippable && theme.palette.secondary.main};

    ${GearIcon} {
      flex-shrink: 0;
      margin-right: 4px;
    }

    p {
      max-width: calc(100% - 28px);
      ${size === "small" && smallText}
    }
  `
);
