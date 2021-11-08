/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import CachedIcon from "@mui/icons-material/Cached";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import InfoIcon from "@mui/icons-material/Info";
import LinkIcon from "@mui/icons-material/Link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RemoveIcon from "@mui/icons-material/Remove";
import SaveIcon from "@mui/icons-material/Save";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from "@mui/icons-material/Star";
import TwitterIcon from "@mui/icons-material/Twitter";

import { KctoolsIcon } from "../../atoms";
import { withIconButton } from "./withIconButton";

export const AddButton = withIconButton(AddIcon);
export const IncreaseButton = AddButton;
export const DecreaseButton = withIconButton(RemoveIcon);
export const CopyButton = withIconButton(FileCopyIcon);
export const CloseButton = withIconButton(CloseIcon);
export const ClearButton = withIconButton(ClearIcon);
export const MoreVertButton = withIconButton(MoreVertIcon);
export const DeleteButton = withIconButton(DeleteIcon);
export const UpdateButton = withIconButton(CachedIcon);
export const LinkButton = withIconButton(LinkIcon);
export const ShareButton = withIconButton(ShareIcon);
export const SaveButton = withIconButton(SaveIcon);
export const InfoButton = withIconButton(InfoIcon);
export const EditButton = withIconButton(EditIcon);
export const OpenInNewButton = withIconButton(OpenInNewIcon);
export const ImportButton = withIconButton(SaveAltIcon);
export const StarButton = withIconButton(StarIcon);
export const BuildButton = withIconButton(BuildIcon);

export const TweetButton = styled(withIconButton(TwitterIcon))`
  color: #3ba9ee;
`;

export const KctoolsButton = withIconButton(KctoolsIcon);
KctoolsButton.defaultProps = {
  title: "制空権シミュレータで開く",
};

export * from "./withIconButton";
