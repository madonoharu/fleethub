import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";
import React from "react";
import { cn } from "../../../styles";

type Props = {
  onClick?: () => void;
};

const AddGearButton: React.FCX<Props> = ({ className, onClick }) => {
  return (
    <Button className={className} onClick={onClick}>
      <AddIcon fontSize="small" />
    </Button>
  );
};

export default ({ className, ...props }: React.ComponentProps<typeof AddGearButton>) => (
  <AddGearButton
    {...props}
    className={cn(
      "h-full w-full p-0 text-action-disabled [transition:250ms] [&:hover]:text-action-active",
      className,
    )}
  />
);
