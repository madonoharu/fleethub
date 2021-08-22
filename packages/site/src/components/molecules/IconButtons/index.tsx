import styled from "@emotion/styled";
import AddIcon from "@material-ui/icons/Add";
import CachedIcon from "@material-ui/icons/Cached";
import ClearIcon from "@material-ui/icons/Clear";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import InfoIcon from "@material-ui/icons/Info";
import LinkIcon from "@material-ui/icons/Link";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import RemoveIcon from "@material-ui/icons/Remove";
import SaveIcon from "@material-ui/icons/Save";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import ShareIcon from "@material-ui/icons/Share";
import StarIcon from "@material-ui/icons/Star";
import TwitterIcon from "@material-ui/icons/Twitter";

import { KctoolsIcon } from "../../atoms";
import withIconButton from "./withIconButton";

export { withIconButton };

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

export const TweetButton = styled(withIconButton(TwitterIcon))`
  color: #3ba9ee;
`;

export const KctoolsButton = withIconButton(KctoolsIcon);
KctoolsButton.defaultProps = {
  title: "制空権シミュレータで開く",
};
