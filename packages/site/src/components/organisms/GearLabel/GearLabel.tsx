import { Gear } from "fleethub-core";
import { useTranslation } from "next-i18next/pages";
import React from "react";
import { shallowEqual } from "react-redux";

import { GearEntity } from "../../../store";
import { Flexbox } from "../../atoms";
import { ClearButton, GearExpSelect, GearStarsSelect, UpdateButton } from "../../molecules";
import GearNameplate from "../GearNameplate";
import GearTooltip from "../GearTooltip";
import { cn } from "../../../styles";

const GearLabelAction = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div {...props} className={cn("h-full flex items-center ml-auto [&_>_*]:h-full", className)} />
);

type GearLabelProps = {
  gear: Gear;
  equippable?: boolean;

  size?: "small" | "medium" | undefined;

  onUpdate?: (changes: Partial<GearEntity>) => void;
  onRemove?: () => void;
  onReselect?: () => void;
};

const GearLabel: React.FCX<GearLabelProps> = ({
  className,

  gear,
  equippable = true,

  size,

  onUpdate,
  onRemove,
  onReselect,
}) => {
  const { t } = useTranslation("common");

  const handleExpChange = (exp: number) => {
    onUpdate?.({ exp });
  };

  const handleStarsChange = (stars: number) => {
    onUpdate?.({ stars });
  };

  return (
    <Flexbox className={className}>
      <GearTooltip gear={gear}>
        <GearNameplate
          className="min-w-0"
          equippable={equippable}
          iconId={gear.icon_id}
          name={gear.name}
        />
      </GearTooltip>

      <UpdateButton
        title={t("Change")}
        size={size == "small" ? "tiny" : "small"}
        onClick={onReselect}
      />
      <ClearButton
        title={t("Remove")}
        size={size == "small" ? "tiny" : "small"}
        onClick={onRemove}
      />

      <GearLabelAction>
        {gear.has_proficiency() && <GearExpSelect exp={gear.exp} onChange={handleExpChange} />}
        <GearStarsSelect stars={gear.stars} onChange={handleStarsChange} />
      </GearLabelAction>
    </Flexbox>
  );
};

const Memoized = React.memo(
  GearLabel,
  ({ gear: prevGear, ...prevRest }, { gear: nextGear, ...nextRest }) =>
    shallowEqual(prevRest, nextRest) && prevGear.hash === nextGear.hash,
);

export default ({ className, ...props }: React.ComponentProps<typeof Memoized>) => (
  <Memoized
    {...props}
    className={cn(
      "w-full [transition:250ms] pl-1 [&>:not(div:first-of-type)]:shrink-0 [&_.MuiIconButton-root]:hidden [&:hover]:bg-action-hover",
      "[@media(hover:hover)]:[&:hover_.MuiIconButton-root]:block [@media(hover:hover)]:[&:hover>div:first-of-type_p]:hidden",
      "[@media(hover:none)]:[&_.MuiIconButton-root]:block",
      props.size === "small" ? "h-6" : "h-7",
      className,
    )}
  />
);
