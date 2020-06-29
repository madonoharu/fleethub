import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import ClearIcon from "@material-ui/icons/Clear"
import CloseIcon from "@material-ui/icons/Close"
import FileCopyIcon from "@material-ui/icons/FileCopy"
import Delete from "@material-ui/icons/Delete"
import LinkIcon from "@material-ui/icons/Link"
import MoreVert from "@material-ui/icons/MoreVert"
import CachedIcon from "@material-ui/icons/Cached"
import InfoIcon from "@material-ui/icons/Info"
import SaveIcon from "@material-ui/icons/Save"
import ShareIcon from "@material-ui/icons/Share"
import EditIcon from "@material-ui/icons/Edit"
import SaveAltIcon from "@material-ui/icons/SaveAlt"

import withIconButton from "./withIconButton"
import TwitterIcon from "./TwitterIcon"

export { withIconButton }

export const AddButton = withIconButton(AddIcon)
export const IncreaseButton = AddButton
export const DecreaseButton = withIconButton(RemoveIcon)
export const CopyButton = withIconButton(FileCopyIcon)
export const CloseButton = withIconButton(CloseIcon)
export const ClearButton = withIconButton(ClearIcon)
export const MoreVertButton = withIconButton(MoreVert)
export const RemoveButton = withIconButton(Delete)
export const UpdateButton = withIconButton(CachedIcon)
export const LinkButton = withIconButton(LinkIcon)
export const ShareButton = withIconButton(ShareIcon)
export const SaveButton = withIconButton(SaveIcon)
export const InfoButton = withIconButton(InfoIcon)
export const EditButton = withIconButton(EditIcon)
export const ImportButton = withIconButton(SaveAltIcon)
export const TweetButton = withIconButton(TwitterIcon)
