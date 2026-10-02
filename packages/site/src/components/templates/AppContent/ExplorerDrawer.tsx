import { Drawer } from "@mui/material";
import React from "react";

import { cn } from "../../../styles/cn";
import Explorer from "../Explorer";

type Props = {
  open?: boolean;
  children: React.ReactNode;
};

const ExplorerDrawer: React.FC<Props> = ({ open, children }) => {
  return (
    <>
      <Drawer
        slotProps={{
          paper: { className: "mt-10 w-80 h-[calc(100%-40px)]" },
        }}
        variant="persistent"
        open={open}
      >
        <Explorer />
      </Drawer>
      <div
        className={cn(
          "h-[calc(100vh-40px)] overflow-scroll transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open && "ml-80",
        )}
      >
        {children}
      </div>
    </>
  );
};

export default ExplorerDrawer;
