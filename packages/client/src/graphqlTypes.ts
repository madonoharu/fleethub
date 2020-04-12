export type Maybe<T> = T | undefined
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /**
   * A date string, such as 2007-12-03, compliant with the ISO 8601 standard for
   * representation of dates and times using the Gregorian calendar.
   */
  Date: any
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any
}

export type BooleanQueryOperatorInput = {
  eq?: Maybe<Scalars["Boolean"]>
  ne?: Maybe<Scalars["Boolean"]>
  in?: Maybe<Array<Maybe<Scalars["Boolean"]>>>
  nin?: Maybe<Array<Maybe<Scalars["Boolean"]>>>
}

export type DateQueryOperatorInput = {
  eq?: Maybe<Scalars["Date"]>
  ne?: Maybe<Scalars["Date"]>
  gt?: Maybe<Scalars["Date"]>
  gte?: Maybe<Scalars["Date"]>
  lt?: Maybe<Scalars["Date"]>
  lte?: Maybe<Scalars["Date"]>
  in?: Maybe<Array<Maybe<Scalars["Date"]>>>
  nin?: Maybe<Array<Maybe<Scalars["Date"]>>>
}

export type Directory = Node & {
  __typename?: "Directory"
  sourceInstanceName: Scalars["String"]
  absolutePath: Scalars["String"]
  relativePath: Scalars["String"]
  extension: Scalars["String"]
  size: Scalars["Int"]
  prettySize: Scalars["String"]
  modifiedTime: Scalars["Date"]
  accessTime: Scalars["Date"]
  changeTime: Scalars["Date"]
  birthTime: Scalars["Date"]
  root: Scalars["String"]
  dir: Scalars["String"]
  base: Scalars["String"]
  ext: Scalars["String"]
  name: Scalars["String"]
  relativeDirectory: Scalars["String"]
  dev: Scalars["Int"]
  mode: Scalars["Int"]
  nlink: Scalars["Int"]
  uid: Scalars["Int"]
  gid: Scalars["Int"]
  rdev: Scalars["Int"]
  ino: Scalars["Float"]
  atimeMs: Scalars["Float"]
  mtimeMs: Scalars["Float"]
  ctimeMs: Scalars["Float"]
  atime: Scalars["Date"]
  mtime: Scalars["Date"]
  ctime: Scalars["Date"]
  /** @deprecated Use `birthTime` instead */
  birthtime?: Maybe<Scalars["Date"]>
  /** @deprecated Use `birthTime` instead */
  birthtimeMs?: Maybe<Scalars["Float"]>
  blksize?: Maybe<Scalars["Int"]>
  blocks?: Maybe<Scalars["Int"]>
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
}

export type DirectoryModifiedTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryAccessTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryChangeTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryBirthTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryAtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryMtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryCtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type DirectoryConnection = {
  __typename?: "DirectoryConnection"
  totalCount: Scalars["Int"]
  edges: DirectoryEdge[]
  nodes: Directory[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: DirectoryGroupConnection[]
}

export type DirectoryConnectionDistinctArgs = {
  field: DirectoryFieldsEnum
}

export type DirectoryConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: DirectoryFieldsEnum
}

export type DirectoryEdge = {
  __typename?: "DirectoryEdge"
  next?: Maybe<Directory>
  node: Directory
  previous?: Maybe<Directory>
}

export enum DirectoryFieldsEnum {
  sourceInstanceName = "sourceInstanceName",
  absolutePath = "absolutePath",
  relativePath = "relativePath",
  extension = "extension",
  size = "size",
  prettySize = "prettySize",
  modifiedTime = "modifiedTime",
  accessTime = "accessTime",
  changeTime = "changeTime",
  birthTime = "birthTime",
  root = "root",
  dir = "dir",
  base = "base",
  ext = "ext",
  name = "name",
  relativeDirectory = "relativeDirectory",
  dev = "dev",
  mode = "mode",
  nlink = "nlink",
  uid = "uid",
  gid = "gid",
  rdev = "rdev",
  ino = "ino",
  atimeMs = "atimeMs",
  mtimeMs = "mtimeMs",
  ctimeMs = "ctimeMs",
  atime = "atime",
  mtime = "mtime",
  ctime = "ctime",
  birthtime = "birthtime",
  birthtimeMs = "birthtimeMs",
  blksize = "blksize",
  blocks = "blocks",
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
}

export type DirectoryFilterInput = {
  sourceInstanceName?: Maybe<StringQueryOperatorInput>
  absolutePath?: Maybe<StringQueryOperatorInput>
  relativePath?: Maybe<StringQueryOperatorInput>
  extension?: Maybe<StringQueryOperatorInput>
  size?: Maybe<IntQueryOperatorInput>
  prettySize?: Maybe<StringQueryOperatorInput>
  modifiedTime?: Maybe<DateQueryOperatorInput>
  accessTime?: Maybe<DateQueryOperatorInput>
  changeTime?: Maybe<DateQueryOperatorInput>
  birthTime?: Maybe<DateQueryOperatorInput>
  root?: Maybe<StringQueryOperatorInput>
  dir?: Maybe<StringQueryOperatorInput>
  base?: Maybe<StringQueryOperatorInput>
  ext?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  relativeDirectory?: Maybe<StringQueryOperatorInput>
  dev?: Maybe<IntQueryOperatorInput>
  mode?: Maybe<IntQueryOperatorInput>
  nlink?: Maybe<IntQueryOperatorInput>
  uid?: Maybe<IntQueryOperatorInput>
  gid?: Maybe<IntQueryOperatorInput>
  rdev?: Maybe<IntQueryOperatorInput>
  ino?: Maybe<FloatQueryOperatorInput>
  atimeMs?: Maybe<FloatQueryOperatorInput>
  mtimeMs?: Maybe<FloatQueryOperatorInput>
  ctimeMs?: Maybe<FloatQueryOperatorInput>
  atime?: Maybe<DateQueryOperatorInput>
  mtime?: Maybe<DateQueryOperatorInput>
  ctime?: Maybe<DateQueryOperatorInput>
  birthtime?: Maybe<DateQueryOperatorInput>
  birthtimeMs?: Maybe<FloatQueryOperatorInput>
  blksize?: Maybe<IntQueryOperatorInput>
  blocks?: Maybe<IntQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type DirectoryGroupConnection = {
  __typename?: "DirectoryGroupConnection"
  totalCount: Scalars["Int"]
  edges: DirectoryEdge[]
  nodes: Directory[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type DirectorySortInput = {
  fields?: Maybe<Array<Maybe<DirectoryFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type DuotoneGradient = {
  highlight: Scalars["String"]
  shadow: Scalars["String"]
  opacity?: Maybe<Scalars["Int"]>
}

export type File = Node & {
  __typename?: "File"
  sourceInstanceName: Scalars["String"]
  absolutePath: Scalars["String"]
  relativePath: Scalars["String"]
  extension: Scalars["String"]
  size: Scalars["Int"]
  prettySize: Scalars["String"]
  modifiedTime: Scalars["Date"]
  accessTime: Scalars["Date"]
  changeTime: Scalars["Date"]
  birthTime: Scalars["Date"]
  root: Scalars["String"]
  dir: Scalars["String"]
  base: Scalars["String"]
  ext: Scalars["String"]
  name: Scalars["String"]
  relativeDirectory: Scalars["String"]
  dev: Scalars["Int"]
  mode: Scalars["Int"]
  nlink: Scalars["Int"]
  uid: Scalars["Int"]
  gid: Scalars["Int"]
  rdev: Scalars["Int"]
  ino: Scalars["Float"]
  atimeMs: Scalars["Float"]
  mtimeMs: Scalars["Float"]
  ctimeMs: Scalars["Float"]
  atime: Scalars["Date"]
  mtime: Scalars["Date"]
  ctime: Scalars["Date"]
  /** @deprecated Use `birthTime` instead */
  birthtime?: Maybe<Scalars["Date"]>
  /** @deprecated Use `birthTime` instead */
  birthtimeMs?: Maybe<Scalars["Float"]>
  blksize?: Maybe<Scalars["Int"]>
  blocks?: Maybe<Scalars["Int"]>
  /** Copy file to static directory and return public url to it */
  publicURL?: Maybe<Scalars["String"]>
  childImageSharp?: Maybe<ImageSharp>
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
}

export type FileModifiedTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileAccessTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileChangeTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileBirthTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileAtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileMtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileCtimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type FileConnection = {
  __typename?: "FileConnection"
  totalCount: Scalars["Int"]
  edges: FileEdge[]
  nodes: File[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: FileGroupConnection[]
}

export type FileConnectionDistinctArgs = {
  field: FileFieldsEnum
}

export type FileConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: FileFieldsEnum
}

export type FileEdge = {
  __typename?: "FileEdge"
  next?: Maybe<File>
  node: File
  previous?: Maybe<File>
}

export enum FileFieldsEnum {
  sourceInstanceName = "sourceInstanceName",
  absolutePath = "absolutePath",
  relativePath = "relativePath",
  extension = "extension",
  size = "size",
  prettySize = "prettySize",
  modifiedTime = "modifiedTime",
  accessTime = "accessTime",
  changeTime = "changeTime",
  birthTime = "birthTime",
  root = "root",
  dir = "dir",
  base = "base",
  ext = "ext",
  name = "name",
  relativeDirectory = "relativeDirectory",
  dev = "dev",
  mode = "mode",
  nlink = "nlink",
  uid = "uid",
  gid = "gid",
  rdev = "rdev",
  ino = "ino",
  atimeMs = "atimeMs",
  mtimeMs = "mtimeMs",
  ctimeMs = "ctimeMs",
  atime = "atime",
  mtime = "mtime",
  ctime = "ctime",
  birthtime = "birthtime",
  birthtimeMs = "birthtimeMs",
  blksize = "blksize",
  blocks = "blocks",
  publicURL = "publicURL",
  childImageSharp___fixed___base64 = "childImageSharp___fixed___base64",
  childImageSharp___fixed___tracedSVG = "childImageSharp___fixed___tracedSVG",
  childImageSharp___fixed___aspectRatio = "childImageSharp___fixed___aspectRatio",
  childImageSharp___fixed___width = "childImageSharp___fixed___width",
  childImageSharp___fixed___height = "childImageSharp___fixed___height",
  childImageSharp___fixed___src = "childImageSharp___fixed___src",
  childImageSharp___fixed___srcSet = "childImageSharp___fixed___srcSet",
  childImageSharp___fixed___srcWebp = "childImageSharp___fixed___srcWebp",
  childImageSharp___fixed___srcSetWebp = "childImageSharp___fixed___srcSetWebp",
  childImageSharp___fixed___originalName = "childImageSharp___fixed___originalName",
  childImageSharp___resolutions___base64 = "childImageSharp___resolutions___base64",
  childImageSharp___resolutions___tracedSVG = "childImageSharp___resolutions___tracedSVG",
  childImageSharp___resolutions___aspectRatio = "childImageSharp___resolutions___aspectRatio",
  childImageSharp___resolutions___width = "childImageSharp___resolutions___width",
  childImageSharp___resolutions___height = "childImageSharp___resolutions___height",
  childImageSharp___resolutions___src = "childImageSharp___resolutions___src",
  childImageSharp___resolutions___srcSet = "childImageSharp___resolutions___srcSet",
  childImageSharp___resolutions___srcWebp = "childImageSharp___resolutions___srcWebp",
  childImageSharp___resolutions___srcSetWebp = "childImageSharp___resolutions___srcSetWebp",
  childImageSharp___resolutions___originalName = "childImageSharp___resolutions___originalName",
  childImageSharp___fluid___base64 = "childImageSharp___fluid___base64",
  childImageSharp___fluid___tracedSVG = "childImageSharp___fluid___tracedSVG",
  childImageSharp___fluid___aspectRatio = "childImageSharp___fluid___aspectRatio",
  childImageSharp___fluid___src = "childImageSharp___fluid___src",
  childImageSharp___fluid___srcSet = "childImageSharp___fluid___srcSet",
  childImageSharp___fluid___srcWebp = "childImageSharp___fluid___srcWebp",
  childImageSharp___fluid___srcSetWebp = "childImageSharp___fluid___srcSetWebp",
  childImageSharp___fluid___sizes = "childImageSharp___fluid___sizes",
  childImageSharp___fluid___originalImg = "childImageSharp___fluid___originalImg",
  childImageSharp___fluid___originalName = "childImageSharp___fluid___originalName",
  childImageSharp___fluid___presentationWidth = "childImageSharp___fluid___presentationWidth",
  childImageSharp___fluid___presentationHeight = "childImageSharp___fluid___presentationHeight",
  childImageSharp___sizes___base64 = "childImageSharp___sizes___base64",
  childImageSharp___sizes___tracedSVG = "childImageSharp___sizes___tracedSVG",
  childImageSharp___sizes___aspectRatio = "childImageSharp___sizes___aspectRatio",
  childImageSharp___sizes___src = "childImageSharp___sizes___src",
  childImageSharp___sizes___srcSet = "childImageSharp___sizes___srcSet",
  childImageSharp___sizes___srcWebp = "childImageSharp___sizes___srcWebp",
  childImageSharp___sizes___srcSetWebp = "childImageSharp___sizes___srcSetWebp",
  childImageSharp___sizes___sizes = "childImageSharp___sizes___sizes",
  childImageSharp___sizes___originalImg = "childImageSharp___sizes___originalImg",
  childImageSharp___sizes___originalName = "childImageSharp___sizes___originalName",
  childImageSharp___sizes___presentationWidth = "childImageSharp___sizes___presentationWidth",
  childImageSharp___sizes___presentationHeight = "childImageSharp___sizes___presentationHeight",
  childImageSharp___original___width = "childImageSharp___original___width",
  childImageSharp___original___height = "childImageSharp___original___height",
  childImageSharp___original___src = "childImageSharp___original___src",
  childImageSharp___resize___src = "childImageSharp___resize___src",
  childImageSharp___resize___tracedSVG = "childImageSharp___resize___tracedSVG",
  childImageSharp___resize___width = "childImageSharp___resize___width",
  childImageSharp___resize___height = "childImageSharp___resize___height",
  childImageSharp___resize___aspectRatio = "childImageSharp___resize___aspectRatio",
  childImageSharp___resize___originalName = "childImageSharp___resize___originalName",
  childImageSharp___id = "childImageSharp___id",
  childImageSharp___parent___id = "childImageSharp___parent___id",
  childImageSharp___parent___parent___id = "childImageSharp___parent___parent___id",
  childImageSharp___parent___parent___children = "childImageSharp___parent___parent___children",
  childImageSharp___parent___children = "childImageSharp___parent___children",
  childImageSharp___parent___children___id = "childImageSharp___parent___children___id",
  childImageSharp___parent___children___children = "childImageSharp___parent___children___children",
  childImageSharp___parent___internal___content = "childImageSharp___parent___internal___content",
  childImageSharp___parent___internal___contentDigest = "childImageSharp___parent___internal___contentDigest",
  childImageSharp___parent___internal___description = "childImageSharp___parent___internal___description",
  childImageSharp___parent___internal___fieldOwners = "childImageSharp___parent___internal___fieldOwners",
  childImageSharp___parent___internal___ignoreType = "childImageSharp___parent___internal___ignoreType",
  childImageSharp___parent___internal___mediaType = "childImageSharp___parent___internal___mediaType",
  childImageSharp___parent___internal___owner = "childImageSharp___parent___internal___owner",
  childImageSharp___parent___internal___type = "childImageSharp___parent___internal___type",
  childImageSharp___children = "childImageSharp___children",
  childImageSharp___children___id = "childImageSharp___children___id",
  childImageSharp___children___parent___id = "childImageSharp___children___parent___id",
  childImageSharp___children___parent___children = "childImageSharp___children___parent___children",
  childImageSharp___children___children = "childImageSharp___children___children",
  childImageSharp___children___children___id = "childImageSharp___children___children___id",
  childImageSharp___children___children___children = "childImageSharp___children___children___children",
  childImageSharp___children___internal___content = "childImageSharp___children___internal___content",
  childImageSharp___children___internal___contentDigest = "childImageSharp___children___internal___contentDigest",
  childImageSharp___children___internal___description = "childImageSharp___children___internal___description",
  childImageSharp___children___internal___fieldOwners = "childImageSharp___children___internal___fieldOwners",
  childImageSharp___children___internal___ignoreType = "childImageSharp___children___internal___ignoreType",
  childImageSharp___children___internal___mediaType = "childImageSharp___children___internal___mediaType",
  childImageSharp___children___internal___owner = "childImageSharp___children___internal___owner",
  childImageSharp___children___internal___type = "childImageSharp___children___internal___type",
  childImageSharp___internal___content = "childImageSharp___internal___content",
  childImageSharp___internal___contentDigest = "childImageSharp___internal___contentDigest",
  childImageSharp___internal___description = "childImageSharp___internal___description",
  childImageSharp___internal___fieldOwners = "childImageSharp___internal___fieldOwners",
  childImageSharp___internal___ignoreType = "childImageSharp___internal___ignoreType",
  childImageSharp___internal___mediaType = "childImageSharp___internal___mediaType",
  childImageSharp___internal___owner = "childImageSharp___internal___owner",
  childImageSharp___internal___type = "childImageSharp___internal___type",
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
}

export type FileFilterInput = {
  sourceInstanceName?: Maybe<StringQueryOperatorInput>
  absolutePath?: Maybe<StringQueryOperatorInput>
  relativePath?: Maybe<StringQueryOperatorInput>
  extension?: Maybe<StringQueryOperatorInput>
  size?: Maybe<IntQueryOperatorInput>
  prettySize?: Maybe<StringQueryOperatorInput>
  modifiedTime?: Maybe<DateQueryOperatorInput>
  accessTime?: Maybe<DateQueryOperatorInput>
  changeTime?: Maybe<DateQueryOperatorInput>
  birthTime?: Maybe<DateQueryOperatorInput>
  root?: Maybe<StringQueryOperatorInput>
  dir?: Maybe<StringQueryOperatorInput>
  base?: Maybe<StringQueryOperatorInput>
  ext?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  relativeDirectory?: Maybe<StringQueryOperatorInput>
  dev?: Maybe<IntQueryOperatorInput>
  mode?: Maybe<IntQueryOperatorInput>
  nlink?: Maybe<IntQueryOperatorInput>
  uid?: Maybe<IntQueryOperatorInput>
  gid?: Maybe<IntQueryOperatorInput>
  rdev?: Maybe<IntQueryOperatorInput>
  ino?: Maybe<FloatQueryOperatorInput>
  atimeMs?: Maybe<FloatQueryOperatorInput>
  mtimeMs?: Maybe<FloatQueryOperatorInput>
  ctimeMs?: Maybe<FloatQueryOperatorInput>
  atime?: Maybe<DateQueryOperatorInput>
  mtime?: Maybe<DateQueryOperatorInput>
  ctime?: Maybe<DateQueryOperatorInput>
  birthtime?: Maybe<DateQueryOperatorInput>
  birthtimeMs?: Maybe<FloatQueryOperatorInput>
  blksize?: Maybe<IntQueryOperatorInput>
  blocks?: Maybe<IntQueryOperatorInput>
  publicURL?: Maybe<StringQueryOperatorInput>
  childImageSharp?: Maybe<ImageSharpFilterInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type FileGroupConnection = {
  __typename?: "FileGroupConnection"
  totalCount: Scalars["Int"]
  edges: FileEdge[]
  nodes: File[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type FileSortInput = {
  fields?: Maybe<Array<Maybe<FileFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type FloatQueryOperatorInput = {
  eq?: Maybe<Scalars["Float"]>
  ne?: Maybe<Scalars["Float"]>
  gt?: Maybe<Scalars["Float"]>
  gte?: Maybe<Scalars["Float"]>
  lt?: Maybe<Scalars["Float"]>
  lte?: Maybe<Scalars["Float"]>
  in?: Maybe<Array<Maybe<Scalars["Float"]>>>
  nin?: Maybe<Array<Maybe<Scalars["Float"]>>>
}

export enum ImageCropFocus {
  CENTER = "CENTER",
  NORTH = "NORTH",
  NORTHEAST = "NORTHEAST",
  EAST = "EAST",
  SOUTHEAST = "SOUTHEAST",
  SOUTH = "SOUTH",
  SOUTHWEST = "SOUTHWEST",
  WEST = "WEST",
  NORTHWEST = "NORTHWEST",
  ENTROPY = "ENTROPY",
  ATTENTION = "ATTENTION",
}

export enum ImageFit {
  COVER = "COVER",
  CONTAIN = "CONTAIN",
  FILL = "FILL",
  INSIDE = "INSIDE",
  OUTSIDE = "OUTSIDE",
}

export enum ImageFormat {
  NO_CHANGE = "NO_CHANGE",
  JPG = "JPG",
  PNG = "PNG",
  WEBP = "WEBP",
}

export type ImageSharp = Node & {
  __typename?: "ImageSharp"
  fixed?: Maybe<ImageSharpFixed>
  /** @deprecated Resolutions was deprecated in Gatsby v2. It's been renamed to "fixed" https://example.com/write-docs-and-fix-this-example-link */
  resolutions?: Maybe<ImageSharpResolutions>
  fluid?: Maybe<ImageSharpFluid>
  /** @deprecated Sizes was deprecated in Gatsby v2. It's been renamed to "fluid" https://example.com/write-docs-and-fix-this-example-link */
  sizes?: Maybe<ImageSharpSizes>
  original?: Maybe<ImageSharpOriginal>
  resize?: Maybe<ImageSharpResize>
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
}

export type ImageSharpFixedArgs = {
  width?: Maybe<Scalars["Int"]>
  height?: Maybe<Scalars["Int"]>
  base64Width?: Maybe<Scalars["Int"]>
  jpegProgressive?: Maybe<Scalars["Boolean"]>
  pngCompressionSpeed?: Maybe<Scalars["Int"]>
  grayscale?: Maybe<Scalars["Boolean"]>
  duotone?: Maybe<DuotoneGradient>
  traceSVG?: Maybe<Potrace>
  quality?: Maybe<Scalars["Int"]>
  jpegQuality?: Maybe<Scalars["Int"]>
  pngQuality?: Maybe<Scalars["Int"]>
  webpQuality?: Maybe<Scalars["Int"]>
  toFormat?: Maybe<ImageFormat>
  toFormatBase64?: Maybe<ImageFormat>
  cropFocus?: Maybe<ImageCropFocus>
  fit?: Maybe<ImageFit>
  background?: Maybe<Scalars["String"]>
  rotate?: Maybe<Scalars["Int"]>
  trim?: Maybe<Scalars["Float"]>
}

export type ImageSharpResolutionsArgs = {
  width?: Maybe<Scalars["Int"]>
  height?: Maybe<Scalars["Int"]>
  base64Width?: Maybe<Scalars["Int"]>
  jpegProgressive?: Maybe<Scalars["Boolean"]>
  pngCompressionSpeed?: Maybe<Scalars["Int"]>
  grayscale?: Maybe<Scalars["Boolean"]>
  duotone?: Maybe<DuotoneGradient>
  traceSVG?: Maybe<Potrace>
  quality?: Maybe<Scalars["Int"]>
  jpegQuality?: Maybe<Scalars["Int"]>
  pngQuality?: Maybe<Scalars["Int"]>
  webpQuality?: Maybe<Scalars["Int"]>
  toFormat?: Maybe<ImageFormat>
  toFormatBase64?: Maybe<ImageFormat>
  cropFocus?: Maybe<ImageCropFocus>
  fit?: Maybe<ImageFit>
  background?: Maybe<Scalars["String"]>
  rotate?: Maybe<Scalars["Int"]>
  trim?: Maybe<Scalars["Float"]>
}

export type ImageSharpFluidArgs = {
  maxWidth?: Maybe<Scalars["Int"]>
  maxHeight?: Maybe<Scalars["Int"]>
  base64Width?: Maybe<Scalars["Int"]>
  grayscale?: Maybe<Scalars["Boolean"]>
  jpegProgressive?: Maybe<Scalars["Boolean"]>
  pngCompressionSpeed?: Maybe<Scalars["Int"]>
  duotone?: Maybe<DuotoneGradient>
  traceSVG?: Maybe<Potrace>
  quality?: Maybe<Scalars["Int"]>
  jpegQuality?: Maybe<Scalars["Int"]>
  pngQuality?: Maybe<Scalars["Int"]>
  webpQuality?: Maybe<Scalars["Int"]>
  toFormat?: Maybe<ImageFormat>
  toFormatBase64?: Maybe<ImageFormat>
  cropFocus?: Maybe<ImageCropFocus>
  fit?: Maybe<ImageFit>
  background?: Maybe<Scalars["String"]>
  rotate?: Maybe<Scalars["Int"]>
  trim?: Maybe<Scalars["Float"]>
  sizes?: Maybe<Scalars["String"]>
  srcSetBreakpoints?: Maybe<Array<Maybe<Scalars["Int"]>>>
}

export type ImageSharpSizesArgs = {
  maxWidth?: Maybe<Scalars["Int"]>
  maxHeight?: Maybe<Scalars["Int"]>
  base64Width?: Maybe<Scalars["Int"]>
  grayscale?: Maybe<Scalars["Boolean"]>
  jpegProgressive?: Maybe<Scalars["Boolean"]>
  pngCompressionSpeed?: Maybe<Scalars["Int"]>
  duotone?: Maybe<DuotoneGradient>
  traceSVG?: Maybe<Potrace>
  quality?: Maybe<Scalars["Int"]>
  jpegQuality?: Maybe<Scalars["Int"]>
  pngQuality?: Maybe<Scalars["Int"]>
  webpQuality?: Maybe<Scalars["Int"]>
  toFormat?: Maybe<ImageFormat>
  toFormatBase64?: Maybe<ImageFormat>
  cropFocus?: Maybe<ImageCropFocus>
  fit?: Maybe<ImageFit>
  background?: Maybe<Scalars["String"]>
  rotate?: Maybe<Scalars["Int"]>
  trim?: Maybe<Scalars["Float"]>
  sizes?: Maybe<Scalars["String"]>
  srcSetBreakpoints?: Maybe<Array<Maybe<Scalars["Int"]>>>
}

export type ImageSharpResizeArgs = {
  width?: Maybe<Scalars["Int"]>
  height?: Maybe<Scalars["Int"]>
  quality?: Maybe<Scalars["Int"]>
  jpegQuality?: Maybe<Scalars["Int"]>
  pngQuality?: Maybe<Scalars["Int"]>
  webpQuality?: Maybe<Scalars["Int"]>
  jpegProgressive?: Maybe<Scalars["Boolean"]>
  pngCompressionLevel?: Maybe<Scalars["Int"]>
  pngCompressionSpeed?: Maybe<Scalars["Int"]>
  grayscale?: Maybe<Scalars["Boolean"]>
  duotone?: Maybe<DuotoneGradient>
  base64?: Maybe<Scalars["Boolean"]>
  traceSVG?: Maybe<Potrace>
  toFormat?: Maybe<ImageFormat>
  cropFocus?: Maybe<ImageCropFocus>
  fit?: Maybe<ImageFit>
  background?: Maybe<Scalars["String"]>
  rotate?: Maybe<Scalars["Int"]>
  trim?: Maybe<Scalars["Float"]>
}

export type ImageSharpConnection = {
  __typename?: "ImageSharpConnection"
  totalCount: Scalars["Int"]
  edges: ImageSharpEdge[]
  nodes: ImageSharp[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: ImageSharpGroupConnection[]
}

export type ImageSharpConnectionDistinctArgs = {
  field: ImageSharpFieldsEnum
}

export type ImageSharpConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: ImageSharpFieldsEnum
}

export type ImageSharpEdge = {
  __typename?: "ImageSharpEdge"
  next?: Maybe<ImageSharp>
  node: ImageSharp
  previous?: Maybe<ImageSharp>
}

export enum ImageSharpFieldsEnum {
  fixed___base64 = "fixed___base64",
  fixed___tracedSVG = "fixed___tracedSVG",
  fixed___aspectRatio = "fixed___aspectRatio",
  fixed___width = "fixed___width",
  fixed___height = "fixed___height",
  fixed___src = "fixed___src",
  fixed___srcSet = "fixed___srcSet",
  fixed___srcWebp = "fixed___srcWebp",
  fixed___srcSetWebp = "fixed___srcSetWebp",
  fixed___originalName = "fixed___originalName",
  resolutions___base64 = "resolutions___base64",
  resolutions___tracedSVG = "resolutions___tracedSVG",
  resolutions___aspectRatio = "resolutions___aspectRatio",
  resolutions___width = "resolutions___width",
  resolutions___height = "resolutions___height",
  resolutions___src = "resolutions___src",
  resolutions___srcSet = "resolutions___srcSet",
  resolutions___srcWebp = "resolutions___srcWebp",
  resolutions___srcSetWebp = "resolutions___srcSetWebp",
  resolutions___originalName = "resolutions___originalName",
  fluid___base64 = "fluid___base64",
  fluid___tracedSVG = "fluid___tracedSVG",
  fluid___aspectRatio = "fluid___aspectRatio",
  fluid___src = "fluid___src",
  fluid___srcSet = "fluid___srcSet",
  fluid___srcWebp = "fluid___srcWebp",
  fluid___srcSetWebp = "fluid___srcSetWebp",
  fluid___sizes = "fluid___sizes",
  fluid___originalImg = "fluid___originalImg",
  fluid___originalName = "fluid___originalName",
  fluid___presentationWidth = "fluid___presentationWidth",
  fluid___presentationHeight = "fluid___presentationHeight",
  sizes___base64 = "sizes___base64",
  sizes___tracedSVG = "sizes___tracedSVG",
  sizes___aspectRatio = "sizes___aspectRatio",
  sizes___src = "sizes___src",
  sizes___srcSet = "sizes___srcSet",
  sizes___srcWebp = "sizes___srcWebp",
  sizes___srcSetWebp = "sizes___srcSetWebp",
  sizes___sizes = "sizes___sizes",
  sizes___originalImg = "sizes___originalImg",
  sizes___originalName = "sizes___originalName",
  sizes___presentationWidth = "sizes___presentationWidth",
  sizes___presentationHeight = "sizes___presentationHeight",
  original___width = "original___width",
  original___height = "original___height",
  original___src = "original___src",
  resize___src = "resize___src",
  resize___tracedSVG = "resize___tracedSVG",
  resize___width = "resize___width",
  resize___height = "resize___height",
  resize___aspectRatio = "resize___aspectRatio",
  resize___originalName = "resize___originalName",
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
}

export type ImageSharpFilterInput = {
  fixed?: Maybe<ImageSharpFixedFilterInput>
  resolutions?: Maybe<ImageSharpResolutionsFilterInput>
  fluid?: Maybe<ImageSharpFluidFilterInput>
  sizes?: Maybe<ImageSharpSizesFilterInput>
  original?: Maybe<ImageSharpOriginalFilterInput>
  resize?: Maybe<ImageSharpResizeFilterInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type ImageSharpFixed = {
  __typename?: "ImageSharpFixed"
  base64?: Maybe<Scalars["String"]>
  tracedSVG?: Maybe<Scalars["String"]>
  aspectRatio?: Maybe<Scalars["Float"]>
  width: Scalars["Float"]
  height: Scalars["Float"]
  src: Scalars["String"]
  srcSet: Scalars["String"]
  srcWebp?: Maybe<Scalars["String"]>
  srcSetWebp?: Maybe<Scalars["String"]>
  originalName?: Maybe<Scalars["String"]>
}

export type ImageSharpFixedFilterInput = {
  base64?: Maybe<StringQueryOperatorInput>
  tracedSVG?: Maybe<StringQueryOperatorInput>
  aspectRatio?: Maybe<FloatQueryOperatorInput>
  width?: Maybe<FloatQueryOperatorInput>
  height?: Maybe<FloatQueryOperatorInput>
  src?: Maybe<StringQueryOperatorInput>
  srcSet?: Maybe<StringQueryOperatorInput>
  srcWebp?: Maybe<StringQueryOperatorInput>
  srcSetWebp?: Maybe<StringQueryOperatorInput>
  originalName?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpFluid = {
  __typename?: "ImageSharpFluid"
  base64?: Maybe<Scalars["String"]>
  tracedSVG?: Maybe<Scalars["String"]>
  aspectRatio: Scalars["Float"]
  src: Scalars["String"]
  srcSet: Scalars["String"]
  srcWebp?: Maybe<Scalars["String"]>
  srcSetWebp?: Maybe<Scalars["String"]>
  sizes: Scalars["String"]
  originalImg?: Maybe<Scalars["String"]>
  originalName?: Maybe<Scalars["String"]>
  presentationWidth?: Maybe<Scalars["Int"]>
  presentationHeight?: Maybe<Scalars["Int"]>
}

export type ImageSharpFluidFilterInput = {
  base64?: Maybe<StringQueryOperatorInput>
  tracedSVG?: Maybe<StringQueryOperatorInput>
  aspectRatio?: Maybe<FloatQueryOperatorInput>
  src?: Maybe<StringQueryOperatorInput>
  srcSet?: Maybe<StringQueryOperatorInput>
  srcWebp?: Maybe<StringQueryOperatorInput>
  srcSetWebp?: Maybe<StringQueryOperatorInput>
  sizes?: Maybe<StringQueryOperatorInput>
  originalImg?: Maybe<StringQueryOperatorInput>
  originalName?: Maybe<StringQueryOperatorInput>
  presentationWidth?: Maybe<IntQueryOperatorInput>
  presentationHeight?: Maybe<IntQueryOperatorInput>
}

export type ImageSharpGroupConnection = {
  __typename?: "ImageSharpGroupConnection"
  totalCount: Scalars["Int"]
  edges: ImageSharpEdge[]
  nodes: ImageSharp[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type ImageSharpOriginal = {
  __typename?: "ImageSharpOriginal"
  width?: Maybe<Scalars["Float"]>
  height?: Maybe<Scalars["Float"]>
  src?: Maybe<Scalars["String"]>
}

export type ImageSharpOriginalFilterInput = {
  width?: Maybe<FloatQueryOperatorInput>
  height?: Maybe<FloatQueryOperatorInput>
  src?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpResize = {
  __typename?: "ImageSharpResize"
  src?: Maybe<Scalars["String"]>
  tracedSVG?: Maybe<Scalars["String"]>
  width?: Maybe<Scalars["Int"]>
  height?: Maybe<Scalars["Int"]>
  aspectRatio?: Maybe<Scalars["Float"]>
  originalName?: Maybe<Scalars["String"]>
}

export type ImageSharpResizeFilterInput = {
  src?: Maybe<StringQueryOperatorInput>
  tracedSVG?: Maybe<StringQueryOperatorInput>
  width?: Maybe<IntQueryOperatorInput>
  height?: Maybe<IntQueryOperatorInput>
  aspectRatio?: Maybe<FloatQueryOperatorInput>
  originalName?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpResolutions = {
  __typename?: "ImageSharpResolutions"
  base64?: Maybe<Scalars["String"]>
  tracedSVG?: Maybe<Scalars["String"]>
  aspectRatio?: Maybe<Scalars["Float"]>
  width: Scalars["Float"]
  height: Scalars["Float"]
  src: Scalars["String"]
  srcSet: Scalars["String"]
  srcWebp?: Maybe<Scalars["String"]>
  srcSetWebp?: Maybe<Scalars["String"]>
  originalName?: Maybe<Scalars["String"]>
}

export type ImageSharpResolutionsFilterInput = {
  base64?: Maybe<StringQueryOperatorInput>
  tracedSVG?: Maybe<StringQueryOperatorInput>
  aspectRatio?: Maybe<FloatQueryOperatorInput>
  width?: Maybe<FloatQueryOperatorInput>
  height?: Maybe<FloatQueryOperatorInput>
  src?: Maybe<StringQueryOperatorInput>
  srcSet?: Maybe<StringQueryOperatorInput>
  srcWebp?: Maybe<StringQueryOperatorInput>
  srcSetWebp?: Maybe<StringQueryOperatorInput>
  originalName?: Maybe<StringQueryOperatorInput>
}

export type ImageSharpSizes = {
  __typename?: "ImageSharpSizes"
  base64?: Maybe<Scalars["String"]>
  tracedSVG?: Maybe<Scalars["String"]>
  aspectRatio: Scalars["Float"]
  src: Scalars["String"]
  srcSet: Scalars["String"]
  srcWebp?: Maybe<Scalars["String"]>
  srcSetWebp?: Maybe<Scalars["String"]>
  sizes: Scalars["String"]
  originalImg?: Maybe<Scalars["String"]>
  originalName?: Maybe<Scalars["String"]>
  presentationWidth?: Maybe<Scalars["Int"]>
  presentationHeight?: Maybe<Scalars["Int"]>
}

export type ImageSharpSizesFilterInput = {
  base64?: Maybe<StringQueryOperatorInput>
  tracedSVG?: Maybe<StringQueryOperatorInput>
  aspectRatio?: Maybe<FloatQueryOperatorInput>
  src?: Maybe<StringQueryOperatorInput>
  srcSet?: Maybe<StringQueryOperatorInput>
  srcWebp?: Maybe<StringQueryOperatorInput>
  srcSetWebp?: Maybe<StringQueryOperatorInput>
  sizes?: Maybe<StringQueryOperatorInput>
  originalImg?: Maybe<StringQueryOperatorInput>
  originalName?: Maybe<StringQueryOperatorInput>
  presentationWidth?: Maybe<IntQueryOperatorInput>
  presentationHeight?: Maybe<IntQueryOperatorInput>
}

export type ImageSharpSortInput = {
  fields?: Maybe<Array<Maybe<ImageSharpFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type Internal = {
  __typename?: "Internal"
  content?: Maybe<Scalars["String"]>
  contentDigest: Scalars["String"]
  description?: Maybe<Scalars["String"]>
  fieldOwners?: Maybe<Array<Maybe<Scalars["String"]>>>
  ignoreType?: Maybe<Scalars["Boolean"]>
  mediaType?: Maybe<Scalars["String"]>
  owner: Scalars["String"]
  type: Scalars["String"]
}

export type InternalFilterInput = {
  content?: Maybe<StringQueryOperatorInput>
  contentDigest?: Maybe<StringQueryOperatorInput>
  description?: Maybe<StringQueryOperatorInput>
  fieldOwners?: Maybe<StringQueryOperatorInput>
  ignoreType?: Maybe<BooleanQueryOperatorInput>
  mediaType?: Maybe<StringQueryOperatorInput>
  owner?: Maybe<StringQueryOperatorInput>
  type?: Maybe<StringQueryOperatorInput>
}

export type IntQueryOperatorInput = {
  eq?: Maybe<Scalars["Int"]>
  ne?: Maybe<Scalars["Int"]>
  gt?: Maybe<Scalars["Int"]>
  gte?: Maybe<Scalars["Int"]>
  lt?: Maybe<Scalars["Int"]>
  lte?: Maybe<Scalars["Int"]>
  in?: Maybe<Array<Maybe<Scalars["Int"]>>>
  nin?: Maybe<Array<Maybe<Scalars["Int"]>>>
}

/** Node Interface */
export type Node = {
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
}

export type NodeFilterInput = {
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type NodeFilterListInput = {
  elemMatch?: Maybe<NodeFilterInput>
}

export type PageInfo = {
  __typename?: "PageInfo"
  currentPage: Scalars["Int"]
  hasPreviousPage: Scalars["Boolean"]
  hasNextPage: Scalars["Boolean"]
  itemCount: Scalars["Int"]
  pageCount: Scalars["Int"]
  perPage?: Maybe<Scalars["Int"]>
}

export type Potrace = {
  turnPolicy?: Maybe<PotraceTurnPolicy>
  turdSize?: Maybe<Scalars["Float"]>
  alphaMax?: Maybe<Scalars["Float"]>
  optCurve?: Maybe<Scalars["Boolean"]>
  optTolerance?: Maybe<Scalars["Float"]>
  threshold?: Maybe<Scalars["Int"]>
  blackOnWhite?: Maybe<Scalars["Boolean"]>
  color?: Maybe<Scalars["String"]>
  background?: Maybe<Scalars["String"]>
}

export enum PotraceTurnPolicy {
  TURNPOLICY_BLACK = "TURNPOLICY_BLACK",
  TURNPOLICY_WHITE = "TURNPOLICY_WHITE",
  TURNPOLICY_LEFT = "TURNPOLICY_LEFT",
  TURNPOLICY_RIGHT = "TURNPOLICY_RIGHT",
  TURNPOLICY_MINORITY = "TURNPOLICY_MINORITY",
  TURNPOLICY_MAJORITY = "TURNPOLICY_MAJORITY",
}

export type Query = {
  __typename?: "Query"
  file?: Maybe<File>
  allFile: FileConnection
  directory?: Maybe<Directory>
  allDirectory: DirectoryConnection
  sitePage?: Maybe<SitePage>
  allSitePage: SitePageConnection
  site?: Maybe<Site>
  allSite: SiteConnection
  imageSharp?: Maybe<ImageSharp>
  allImageSharp: ImageSharpConnection
  siteBuildMetadata?: Maybe<SiteBuildMetadata>
  allSiteBuildMetadata: SiteBuildMetadataConnection
  sitePlugin?: Maybe<SitePlugin>
  allSitePlugin: SitePluginConnection
}

export type QueryFileArgs = {
  sourceInstanceName?: Maybe<StringQueryOperatorInput>
  absolutePath?: Maybe<StringQueryOperatorInput>
  relativePath?: Maybe<StringQueryOperatorInput>
  extension?: Maybe<StringQueryOperatorInput>
  size?: Maybe<IntQueryOperatorInput>
  prettySize?: Maybe<StringQueryOperatorInput>
  modifiedTime?: Maybe<DateQueryOperatorInput>
  accessTime?: Maybe<DateQueryOperatorInput>
  changeTime?: Maybe<DateQueryOperatorInput>
  birthTime?: Maybe<DateQueryOperatorInput>
  root?: Maybe<StringQueryOperatorInput>
  dir?: Maybe<StringQueryOperatorInput>
  base?: Maybe<StringQueryOperatorInput>
  ext?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  relativeDirectory?: Maybe<StringQueryOperatorInput>
  dev?: Maybe<IntQueryOperatorInput>
  mode?: Maybe<IntQueryOperatorInput>
  nlink?: Maybe<IntQueryOperatorInput>
  uid?: Maybe<IntQueryOperatorInput>
  gid?: Maybe<IntQueryOperatorInput>
  rdev?: Maybe<IntQueryOperatorInput>
  ino?: Maybe<FloatQueryOperatorInput>
  atimeMs?: Maybe<FloatQueryOperatorInput>
  mtimeMs?: Maybe<FloatQueryOperatorInput>
  ctimeMs?: Maybe<FloatQueryOperatorInput>
  atime?: Maybe<DateQueryOperatorInput>
  mtime?: Maybe<DateQueryOperatorInput>
  ctime?: Maybe<DateQueryOperatorInput>
  birthtime?: Maybe<DateQueryOperatorInput>
  birthtimeMs?: Maybe<FloatQueryOperatorInput>
  blksize?: Maybe<IntQueryOperatorInput>
  blocks?: Maybe<IntQueryOperatorInput>
  publicURL?: Maybe<StringQueryOperatorInput>
  childImageSharp?: Maybe<ImageSharpFilterInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type QueryAllFileArgs = {
  filter?: Maybe<FileFilterInput>
  sort?: Maybe<FileSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QueryDirectoryArgs = {
  sourceInstanceName?: Maybe<StringQueryOperatorInput>
  absolutePath?: Maybe<StringQueryOperatorInput>
  relativePath?: Maybe<StringQueryOperatorInput>
  extension?: Maybe<StringQueryOperatorInput>
  size?: Maybe<IntQueryOperatorInput>
  prettySize?: Maybe<StringQueryOperatorInput>
  modifiedTime?: Maybe<DateQueryOperatorInput>
  accessTime?: Maybe<DateQueryOperatorInput>
  changeTime?: Maybe<DateQueryOperatorInput>
  birthTime?: Maybe<DateQueryOperatorInput>
  root?: Maybe<StringQueryOperatorInput>
  dir?: Maybe<StringQueryOperatorInput>
  base?: Maybe<StringQueryOperatorInput>
  ext?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  relativeDirectory?: Maybe<StringQueryOperatorInput>
  dev?: Maybe<IntQueryOperatorInput>
  mode?: Maybe<IntQueryOperatorInput>
  nlink?: Maybe<IntQueryOperatorInput>
  uid?: Maybe<IntQueryOperatorInput>
  gid?: Maybe<IntQueryOperatorInput>
  rdev?: Maybe<IntQueryOperatorInput>
  ino?: Maybe<FloatQueryOperatorInput>
  atimeMs?: Maybe<FloatQueryOperatorInput>
  mtimeMs?: Maybe<FloatQueryOperatorInput>
  ctimeMs?: Maybe<FloatQueryOperatorInput>
  atime?: Maybe<DateQueryOperatorInput>
  mtime?: Maybe<DateQueryOperatorInput>
  ctime?: Maybe<DateQueryOperatorInput>
  birthtime?: Maybe<DateQueryOperatorInput>
  birthtimeMs?: Maybe<FloatQueryOperatorInput>
  blksize?: Maybe<IntQueryOperatorInput>
  blocks?: Maybe<IntQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type QueryAllDirectoryArgs = {
  filter?: Maybe<DirectoryFilterInput>
  sort?: Maybe<DirectorySortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QuerySitePageArgs = {
  path?: Maybe<StringQueryOperatorInput>
  component?: Maybe<StringQueryOperatorInput>
  internalComponentName?: Maybe<StringQueryOperatorInput>
  componentChunkName?: Maybe<StringQueryOperatorInput>
  matchPath?: Maybe<StringQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  isCreatedByStatefulCreatePages?: Maybe<BooleanQueryOperatorInput>
  pluginCreator?: Maybe<SitePluginFilterInput>
  pluginCreatorId?: Maybe<StringQueryOperatorInput>
  componentPath?: Maybe<StringQueryOperatorInput>
}

export type QueryAllSitePageArgs = {
  filter?: Maybe<SitePageFilterInput>
  sort?: Maybe<SitePageSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QuerySiteArgs = {
  buildTime?: Maybe<DateQueryOperatorInput>
  siteMetadata?: Maybe<SiteSiteMetadataFilterInput>
  port?: Maybe<IntQueryOperatorInput>
  host?: Maybe<StringQueryOperatorInput>
  polyfill?: Maybe<BooleanQueryOperatorInput>
  pathPrefix?: Maybe<StringQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type QueryAllSiteArgs = {
  filter?: Maybe<SiteFilterInput>
  sort?: Maybe<SiteSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QueryImageSharpArgs = {
  fixed?: Maybe<ImageSharpFixedFilterInput>
  resolutions?: Maybe<ImageSharpResolutionsFilterInput>
  fluid?: Maybe<ImageSharpFluidFilterInput>
  sizes?: Maybe<ImageSharpSizesFilterInput>
  original?: Maybe<ImageSharpOriginalFilterInput>
  resize?: Maybe<ImageSharpResizeFilterInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type QueryAllImageSharpArgs = {
  filter?: Maybe<ImageSharpFilterInput>
  sort?: Maybe<ImageSharpSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QuerySiteBuildMetadataArgs = {
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  buildTime?: Maybe<DateQueryOperatorInput>
}

export type QueryAllSiteBuildMetadataArgs = {
  filter?: Maybe<SiteBuildMetadataFilterInput>
  sort?: Maybe<SiteBuildMetadataSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type QuerySitePluginArgs = {
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  resolve?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
  pluginOptions?: Maybe<SitePluginPluginOptionsFilterInput>
  nodeAPIs?: Maybe<StringQueryOperatorInput>
  ssrAPIs?: Maybe<StringQueryOperatorInput>
  pluginFilepath?: Maybe<StringQueryOperatorInput>
  packageJson?: Maybe<SitePluginPackageJsonFilterInput>
}

export type QueryAllSitePluginArgs = {
  filter?: Maybe<SitePluginFilterInput>
  sort?: Maybe<SitePluginSortInput>
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
}

export type Site = Node & {
  __typename?: "Site"
  buildTime?: Maybe<Scalars["Date"]>
  siteMetadata?: Maybe<SiteSiteMetadata>
  port?: Maybe<Scalars["Int"]>
  host?: Maybe<Scalars["String"]>
  polyfill?: Maybe<Scalars["Boolean"]>
  pathPrefix?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
}

export type SiteBuildTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type SiteBuildMetadata = Node & {
  __typename?: "SiteBuildMetadata"
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
  buildTime?: Maybe<Scalars["Date"]>
}

export type SiteBuildMetadataBuildTimeArgs = {
  formatString?: Maybe<Scalars["String"]>
  fromNow?: Maybe<Scalars["Boolean"]>
  difference?: Maybe<Scalars["String"]>
  locale?: Maybe<Scalars["String"]>
}

export type SiteBuildMetadataConnection = {
  __typename?: "SiteBuildMetadataConnection"
  totalCount: Scalars["Int"]
  edges: SiteBuildMetadataEdge[]
  nodes: SiteBuildMetadata[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: SiteBuildMetadataGroupConnection[]
}

export type SiteBuildMetadataConnectionDistinctArgs = {
  field: SiteBuildMetadataFieldsEnum
}

export type SiteBuildMetadataConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: SiteBuildMetadataFieldsEnum
}

export type SiteBuildMetadataEdge = {
  __typename?: "SiteBuildMetadataEdge"
  next?: Maybe<SiteBuildMetadata>
  node: SiteBuildMetadata
  previous?: Maybe<SiteBuildMetadata>
}

export enum SiteBuildMetadataFieldsEnum {
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
  buildTime = "buildTime",
}

export type SiteBuildMetadataFilterInput = {
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  buildTime?: Maybe<DateQueryOperatorInput>
}

export type SiteBuildMetadataGroupConnection = {
  __typename?: "SiteBuildMetadataGroupConnection"
  totalCount: Scalars["Int"]
  edges: SiteBuildMetadataEdge[]
  nodes: SiteBuildMetadata[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type SiteBuildMetadataSortInput = {
  fields?: Maybe<Array<Maybe<SiteBuildMetadataFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SiteConnection = {
  __typename?: "SiteConnection"
  totalCount: Scalars["Int"]
  edges: SiteEdge[]
  nodes: Site[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: SiteGroupConnection[]
}

export type SiteConnectionDistinctArgs = {
  field: SiteFieldsEnum
}

export type SiteConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: SiteFieldsEnum
}

export type SiteEdge = {
  __typename?: "SiteEdge"
  next?: Maybe<Site>
  node: Site
  previous?: Maybe<Site>
}

export enum SiteFieldsEnum {
  buildTime = "buildTime",
  siteMetadata___title = "siteMetadata___title",
  siteMetadata___description = "siteMetadata___description",
  siteMetadata___author = "siteMetadata___author",
  port = "port",
  host = "host",
  polyfill = "polyfill",
  pathPrefix = "pathPrefix",
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
}

export type SiteFilterInput = {
  buildTime?: Maybe<DateQueryOperatorInput>
  siteMetadata?: Maybe<SiteSiteMetadataFilterInput>
  port?: Maybe<IntQueryOperatorInput>
  host?: Maybe<StringQueryOperatorInput>
  polyfill?: Maybe<BooleanQueryOperatorInput>
  pathPrefix?: Maybe<StringQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
}

export type SiteGroupConnection = {
  __typename?: "SiteGroupConnection"
  totalCount: Scalars["Int"]
  edges: SiteEdge[]
  nodes: Site[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type SitePage = Node & {
  __typename?: "SitePage"
  path: Scalars["String"]
  component: Scalars["String"]
  internalComponentName: Scalars["String"]
  componentChunkName: Scalars["String"]
  matchPath?: Maybe<Scalars["String"]>
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
  isCreatedByStatefulCreatePages?: Maybe<Scalars["Boolean"]>
  pluginCreator?: Maybe<SitePlugin>
  pluginCreatorId?: Maybe<Scalars["String"]>
  componentPath?: Maybe<Scalars["String"]>
}

export type SitePageConnection = {
  __typename?: "SitePageConnection"
  totalCount: Scalars["Int"]
  edges: SitePageEdge[]
  nodes: SitePage[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: SitePageGroupConnection[]
}

export type SitePageConnectionDistinctArgs = {
  field: SitePageFieldsEnum
}

export type SitePageConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: SitePageFieldsEnum
}

export type SitePageEdge = {
  __typename?: "SitePageEdge"
  next?: Maybe<SitePage>
  node: SitePage
  previous?: Maybe<SitePage>
}

export enum SitePageFieldsEnum {
  path = "path",
  component = "component",
  internalComponentName = "internalComponentName",
  componentChunkName = "componentChunkName",
  matchPath = "matchPath",
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
  isCreatedByStatefulCreatePages = "isCreatedByStatefulCreatePages",
  pluginCreator___id = "pluginCreator___id",
  pluginCreator___parent___id = "pluginCreator___parent___id",
  pluginCreator___parent___parent___id = "pluginCreator___parent___parent___id",
  pluginCreator___parent___parent___children = "pluginCreator___parent___parent___children",
  pluginCreator___parent___children = "pluginCreator___parent___children",
  pluginCreator___parent___children___id = "pluginCreator___parent___children___id",
  pluginCreator___parent___children___children = "pluginCreator___parent___children___children",
  pluginCreator___parent___internal___content = "pluginCreator___parent___internal___content",
  pluginCreator___parent___internal___contentDigest = "pluginCreator___parent___internal___contentDigest",
  pluginCreator___parent___internal___description = "pluginCreator___parent___internal___description",
  pluginCreator___parent___internal___fieldOwners = "pluginCreator___parent___internal___fieldOwners",
  pluginCreator___parent___internal___ignoreType = "pluginCreator___parent___internal___ignoreType",
  pluginCreator___parent___internal___mediaType = "pluginCreator___parent___internal___mediaType",
  pluginCreator___parent___internal___owner = "pluginCreator___parent___internal___owner",
  pluginCreator___parent___internal___type = "pluginCreator___parent___internal___type",
  pluginCreator___children = "pluginCreator___children",
  pluginCreator___children___id = "pluginCreator___children___id",
  pluginCreator___children___parent___id = "pluginCreator___children___parent___id",
  pluginCreator___children___parent___children = "pluginCreator___children___parent___children",
  pluginCreator___children___children = "pluginCreator___children___children",
  pluginCreator___children___children___id = "pluginCreator___children___children___id",
  pluginCreator___children___children___children = "pluginCreator___children___children___children",
  pluginCreator___children___internal___content = "pluginCreator___children___internal___content",
  pluginCreator___children___internal___contentDigest = "pluginCreator___children___internal___contentDigest",
  pluginCreator___children___internal___description = "pluginCreator___children___internal___description",
  pluginCreator___children___internal___fieldOwners = "pluginCreator___children___internal___fieldOwners",
  pluginCreator___children___internal___ignoreType = "pluginCreator___children___internal___ignoreType",
  pluginCreator___children___internal___mediaType = "pluginCreator___children___internal___mediaType",
  pluginCreator___children___internal___owner = "pluginCreator___children___internal___owner",
  pluginCreator___children___internal___type = "pluginCreator___children___internal___type",
  pluginCreator___internal___content = "pluginCreator___internal___content",
  pluginCreator___internal___contentDigest = "pluginCreator___internal___contentDigest",
  pluginCreator___internal___description = "pluginCreator___internal___description",
  pluginCreator___internal___fieldOwners = "pluginCreator___internal___fieldOwners",
  pluginCreator___internal___ignoreType = "pluginCreator___internal___ignoreType",
  pluginCreator___internal___mediaType = "pluginCreator___internal___mediaType",
  pluginCreator___internal___owner = "pluginCreator___internal___owner",
  pluginCreator___internal___type = "pluginCreator___internal___type",
  pluginCreator___resolve = "pluginCreator___resolve",
  pluginCreator___name = "pluginCreator___name",
  pluginCreator___version = "pluginCreator___version",
  pluginCreator___pluginOptions___name = "pluginCreator___pluginOptions___name",
  pluginCreator___pluginOptions___path = "pluginCreator___pluginOptions___path",
  pluginCreator___pluginOptions___pathCheck = "pluginCreator___pluginOptions___pathCheck",
  pluginCreator___nodeAPIs = "pluginCreator___nodeAPIs",
  pluginCreator___ssrAPIs = "pluginCreator___ssrAPIs",
  pluginCreator___pluginFilepath = "pluginCreator___pluginFilepath",
  pluginCreator___packageJson___name = "pluginCreator___packageJson___name",
  pluginCreator___packageJson___description = "pluginCreator___packageJson___description",
  pluginCreator___packageJson___version = "pluginCreator___packageJson___version",
  pluginCreator___packageJson___main = "pluginCreator___packageJson___main",
  pluginCreator___packageJson___author = "pluginCreator___packageJson___author",
  pluginCreator___packageJson___license = "pluginCreator___packageJson___license",
  pluginCreator___packageJson___dependencies = "pluginCreator___packageJson___dependencies",
  pluginCreator___packageJson___dependencies___name = "pluginCreator___packageJson___dependencies___name",
  pluginCreator___packageJson___dependencies___version = "pluginCreator___packageJson___dependencies___version",
  pluginCreator___packageJson___devDependencies = "pluginCreator___packageJson___devDependencies",
  pluginCreator___packageJson___devDependencies___name = "pluginCreator___packageJson___devDependencies___name",
  pluginCreator___packageJson___devDependencies___version = "pluginCreator___packageJson___devDependencies___version",
  pluginCreator___packageJson___peerDependencies = "pluginCreator___packageJson___peerDependencies",
  pluginCreator___packageJson___peerDependencies___name = "pluginCreator___packageJson___peerDependencies___name",
  pluginCreator___packageJson___peerDependencies___version = "pluginCreator___packageJson___peerDependencies___version",
  pluginCreator___packageJson___keywords = "pluginCreator___packageJson___keywords",
  pluginCreatorId = "pluginCreatorId",
  componentPath = "componentPath",
}

export type SitePageFilterInput = {
  path?: Maybe<StringQueryOperatorInput>
  component?: Maybe<StringQueryOperatorInput>
  internalComponentName?: Maybe<StringQueryOperatorInput>
  componentChunkName?: Maybe<StringQueryOperatorInput>
  matchPath?: Maybe<StringQueryOperatorInput>
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  isCreatedByStatefulCreatePages?: Maybe<BooleanQueryOperatorInput>
  pluginCreator?: Maybe<SitePluginFilterInput>
  pluginCreatorId?: Maybe<StringQueryOperatorInput>
  componentPath?: Maybe<StringQueryOperatorInput>
}

export type SitePageGroupConnection = {
  __typename?: "SitePageGroupConnection"
  totalCount: Scalars["Int"]
  edges: SitePageEdge[]
  nodes: SitePage[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type SitePageSortInput = {
  fields?: Maybe<Array<Maybe<SitePageFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SitePlugin = Node & {
  __typename?: "SitePlugin"
  id: Scalars["ID"]
  parent?: Maybe<Node>
  children: Node[]
  internal: Internal
  resolve?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["String"]>
  pluginOptions?: Maybe<SitePluginPluginOptions>
  nodeAPIs?: Maybe<Array<Maybe<Scalars["String"]>>>
  ssrAPIs?: Maybe<Array<Maybe<Scalars["String"]>>>
  pluginFilepath?: Maybe<Scalars["String"]>
  packageJson?: Maybe<SitePluginPackageJson>
}

export type SitePluginConnection = {
  __typename?: "SitePluginConnection"
  totalCount: Scalars["Int"]
  edges: SitePluginEdge[]
  nodes: SitePlugin[]
  pageInfo: PageInfo
  distinct: Array<Scalars["String"]>
  group: SitePluginGroupConnection[]
}

export type SitePluginConnectionDistinctArgs = {
  field: SitePluginFieldsEnum
}

export type SitePluginConnectionGroupArgs = {
  skip?: Maybe<Scalars["Int"]>
  limit?: Maybe<Scalars["Int"]>
  field: SitePluginFieldsEnum
}

export type SitePluginEdge = {
  __typename?: "SitePluginEdge"
  next?: Maybe<SitePlugin>
  node: SitePlugin
  previous?: Maybe<SitePlugin>
}

export enum SitePluginFieldsEnum {
  id = "id",
  parent___id = "parent___id",
  parent___parent___id = "parent___parent___id",
  parent___parent___parent___id = "parent___parent___parent___id",
  parent___parent___parent___children = "parent___parent___parent___children",
  parent___parent___children = "parent___parent___children",
  parent___parent___children___id = "parent___parent___children___id",
  parent___parent___children___children = "parent___parent___children___children",
  parent___parent___internal___content = "parent___parent___internal___content",
  parent___parent___internal___contentDigest = "parent___parent___internal___contentDigest",
  parent___parent___internal___description = "parent___parent___internal___description",
  parent___parent___internal___fieldOwners = "parent___parent___internal___fieldOwners",
  parent___parent___internal___ignoreType = "parent___parent___internal___ignoreType",
  parent___parent___internal___mediaType = "parent___parent___internal___mediaType",
  parent___parent___internal___owner = "parent___parent___internal___owner",
  parent___parent___internal___type = "parent___parent___internal___type",
  parent___children = "parent___children",
  parent___children___id = "parent___children___id",
  parent___children___parent___id = "parent___children___parent___id",
  parent___children___parent___children = "parent___children___parent___children",
  parent___children___children = "parent___children___children",
  parent___children___children___id = "parent___children___children___id",
  parent___children___children___children = "parent___children___children___children",
  parent___children___internal___content = "parent___children___internal___content",
  parent___children___internal___contentDigest = "parent___children___internal___contentDigest",
  parent___children___internal___description = "parent___children___internal___description",
  parent___children___internal___fieldOwners = "parent___children___internal___fieldOwners",
  parent___children___internal___ignoreType = "parent___children___internal___ignoreType",
  parent___children___internal___mediaType = "parent___children___internal___mediaType",
  parent___children___internal___owner = "parent___children___internal___owner",
  parent___children___internal___type = "parent___children___internal___type",
  parent___internal___content = "parent___internal___content",
  parent___internal___contentDigest = "parent___internal___contentDigest",
  parent___internal___description = "parent___internal___description",
  parent___internal___fieldOwners = "parent___internal___fieldOwners",
  parent___internal___ignoreType = "parent___internal___ignoreType",
  parent___internal___mediaType = "parent___internal___mediaType",
  parent___internal___owner = "parent___internal___owner",
  parent___internal___type = "parent___internal___type",
  children = "children",
  children___id = "children___id",
  children___parent___id = "children___parent___id",
  children___parent___parent___id = "children___parent___parent___id",
  children___parent___parent___children = "children___parent___parent___children",
  children___parent___children = "children___parent___children",
  children___parent___children___id = "children___parent___children___id",
  children___parent___children___children = "children___parent___children___children",
  children___parent___internal___content = "children___parent___internal___content",
  children___parent___internal___contentDigest = "children___parent___internal___contentDigest",
  children___parent___internal___description = "children___parent___internal___description",
  children___parent___internal___fieldOwners = "children___parent___internal___fieldOwners",
  children___parent___internal___ignoreType = "children___parent___internal___ignoreType",
  children___parent___internal___mediaType = "children___parent___internal___mediaType",
  children___parent___internal___owner = "children___parent___internal___owner",
  children___parent___internal___type = "children___parent___internal___type",
  children___children = "children___children",
  children___children___id = "children___children___id",
  children___children___parent___id = "children___children___parent___id",
  children___children___parent___children = "children___children___parent___children",
  children___children___children = "children___children___children",
  children___children___children___id = "children___children___children___id",
  children___children___children___children = "children___children___children___children",
  children___children___internal___content = "children___children___internal___content",
  children___children___internal___contentDigest = "children___children___internal___contentDigest",
  children___children___internal___description = "children___children___internal___description",
  children___children___internal___fieldOwners = "children___children___internal___fieldOwners",
  children___children___internal___ignoreType = "children___children___internal___ignoreType",
  children___children___internal___mediaType = "children___children___internal___mediaType",
  children___children___internal___owner = "children___children___internal___owner",
  children___children___internal___type = "children___children___internal___type",
  children___internal___content = "children___internal___content",
  children___internal___contentDigest = "children___internal___contentDigest",
  children___internal___description = "children___internal___description",
  children___internal___fieldOwners = "children___internal___fieldOwners",
  children___internal___ignoreType = "children___internal___ignoreType",
  children___internal___mediaType = "children___internal___mediaType",
  children___internal___owner = "children___internal___owner",
  children___internal___type = "children___internal___type",
  internal___content = "internal___content",
  internal___contentDigest = "internal___contentDigest",
  internal___description = "internal___description",
  internal___fieldOwners = "internal___fieldOwners",
  internal___ignoreType = "internal___ignoreType",
  internal___mediaType = "internal___mediaType",
  internal___owner = "internal___owner",
  internal___type = "internal___type",
  resolve = "resolve",
  name = "name",
  version = "version",
  pluginOptions___name = "pluginOptions___name",
  pluginOptions___path = "pluginOptions___path",
  pluginOptions___pathCheck = "pluginOptions___pathCheck",
  nodeAPIs = "nodeAPIs",
  ssrAPIs = "ssrAPIs",
  pluginFilepath = "pluginFilepath",
  packageJson___name = "packageJson___name",
  packageJson___description = "packageJson___description",
  packageJson___version = "packageJson___version",
  packageJson___main = "packageJson___main",
  packageJson___author = "packageJson___author",
  packageJson___license = "packageJson___license",
  packageJson___dependencies = "packageJson___dependencies",
  packageJson___dependencies___name = "packageJson___dependencies___name",
  packageJson___dependencies___version = "packageJson___dependencies___version",
  packageJson___devDependencies = "packageJson___devDependencies",
  packageJson___devDependencies___name = "packageJson___devDependencies___name",
  packageJson___devDependencies___version = "packageJson___devDependencies___version",
  packageJson___peerDependencies = "packageJson___peerDependencies",
  packageJson___peerDependencies___name = "packageJson___peerDependencies___name",
  packageJson___peerDependencies___version = "packageJson___peerDependencies___version",
  packageJson___keywords = "packageJson___keywords",
}

export type SitePluginFilterInput = {
  id?: Maybe<StringQueryOperatorInput>
  parent?: Maybe<NodeFilterInput>
  children?: Maybe<NodeFilterListInput>
  internal?: Maybe<InternalFilterInput>
  resolve?: Maybe<StringQueryOperatorInput>
  name?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
  pluginOptions?: Maybe<SitePluginPluginOptionsFilterInput>
  nodeAPIs?: Maybe<StringQueryOperatorInput>
  ssrAPIs?: Maybe<StringQueryOperatorInput>
  pluginFilepath?: Maybe<StringQueryOperatorInput>
  packageJson?: Maybe<SitePluginPackageJsonFilterInput>
}

export type SitePluginGroupConnection = {
  __typename?: "SitePluginGroupConnection"
  totalCount: Scalars["Int"]
  edges: SitePluginEdge[]
  nodes: SitePlugin[]
  pageInfo: PageInfo
  field: Scalars["String"]
  fieldValue?: Maybe<Scalars["String"]>
}

export type SitePluginPackageJson = {
  __typename?: "SitePluginPackageJson"
  name?: Maybe<Scalars["String"]>
  description?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["String"]>
  main?: Maybe<Scalars["String"]>
  author?: Maybe<Scalars["String"]>
  license?: Maybe<Scalars["String"]>
  dependencies?: Maybe<Array<Maybe<SitePluginPackageJsonDependencies>>>
  devDependencies?: Maybe<Array<Maybe<SitePluginPackageJsonDevDependencies>>>
  peerDependencies?: Maybe<Array<Maybe<SitePluginPackageJsonPeerDependencies>>>
  keywords?: Maybe<Array<Maybe<Scalars["String"]>>>
}

export type SitePluginPackageJsonDependencies = {
  __typename?: "SitePluginPackageJsonDependencies"
  name?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["String"]>
}

export type SitePluginPackageJsonDependenciesFilterInput = {
  name?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonDependenciesFilterListInput = {
  elemMatch?: Maybe<SitePluginPackageJsonDependenciesFilterInput>
}

export type SitePluginPackageJsonDevDependencies = {
  __typename?: "SitePluginPackageJsonDevDependencies"
  name?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["String"]>
}

export type SitePluginPackageJsonDevDependenciesFilterInput = {
  name?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonDevDependenciesFilterListInput = {
  elemMatch?: Maybe<SitePluginPackageJsonDevDependenciesFilterInput>
}

export type SitePluginPackageJsonFilterInput = {
  name?: Maybe<StringQueryOperatorInput>
  description?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
  main?: Maybe<StringQueryOperatorInput>
  author?: Maybe<StringQueryOperatorInput>
  license?: Maybe<StringQueryOperatorInput>
  dependencies?: Maybe<SitePluginPackageJsonDependenciesFilterListInput>
  devDependencies?: Maybe<SitePluginPackageJsonDevDependenciesFilterListInput>
  peerDependencies?: Maybe<SitePluginPackageJsonPeerDependenciesFilterListInput>
  keywords?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonPeerDependencies = {
  __typename?: "SitePluginPackageJsonPeerDependencies"
  name?: Maybe<Scalars["String"]>
  version?: Maybe<Scalars["String"]>
}

export type SitePluginPackageJsonPeerDependenciesFilterInput = {
  name?: Maybe<StringQueryOperatorInput>
  version?: Maybe<StringQueryOperatorInput>
}

export type SitePluginPackageJsonPeerDependenciesFilterListInput = {
  elemMatch?: Maybe<SitePluginPackageJsonPeerDependenciesFilterInput>
}

export type SitePluginPluginOptions = {
  __typename?: "SitePluginPluginOptions"
  name?: Maybe<Scalars["String"]>
  path?: Maybe<Scalars["String"]>
  pathCheck?: Maybe<Scalars["Boolean"]>
}

export type SitePluginPluginOptionsFilterInput = {
  name?: Maybe<StringQueryOperatorInput>
  path?: Maybe<StringQueryOperatorInput>
  pathCheck?: Maybe<BooleanQueryOperatorInput>
}

export type SitePluginSortInput = {
  fields?: Maybe<Array<Maybe<SitePluginFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export type SiteSiteMetadata = {
  __typename?: "SiteSiteMetadata"
  title?: Maybe<Scalars["String"]>
  description?: Maybe<Scalars["String"]>
  author?: Maybe<Scalars["String"]>
}

export type SiteSiteMetadataFilterInput = {
  title?: Maybe<StringQueryOperatorInput>
  description?: Maybe<StringQueryOperatorInput>
  author?: Maybe<StringQueryOperatorInput>
}

export type SiteSortInput = {
  fields?: Maybe<Array<Maybe<SiteFieldsEnum>>>
  order?: Maybe<Array<Maybe<SortOrderEnum>>>
}

export enum SortOrderEnum {
  ASC = "ASC",
  DESC = "DESC",
}

export type StringQueryOperatorInput = {
  eq?: Maybe<Scalars["String"]>
  ne?: Maybe<Scalars["String"]>
  in?: Maybe<Array<Maybe<Scalars["String"]>>>
  nin?: Maybe<Array<Maybe<Scalars["String"]>>>
  regex?: Maybe<Scalars["String"]>
  glob?: Maybe<Scalars["String"]>
}

export type GatsbyImageSharpFixedFragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "base64" | "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpFixed_TracedSvgFragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "tracedSVG" | "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpFixed_WithWebpFragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "base64" | "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpFixed_WithWebp_TracedSvgFragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "tracedSVG" | "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpFixed_NoBase64Fragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpFixed_WithWebp_NoBase64Fragment = { __typename?: "ImageSharpFixed" } & Pick<
  ImageSharpFixed,
  "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpFluidFragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "base64" | "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpFluid_TracedSvgFragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "tracedSVG" | "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpFluid_WithWebpFragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "base64" | "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GatsbyImageSharpFluid_WithWebp_TracedSvgFragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "tracedSVG" | "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GatsbyImageSharpFluid_NoBase64Fragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpFluid_WithWebp_NoBase64Fragment = { __typename?: "ImageSharpFluid" } & Pick<
  ImageSharpFluid,
  "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GatsbyImageSharpResolutionsFragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "base64" | "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpResolutions_TracedSvgFragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "tracedSVG" | "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpResolutions_WithWebpFragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "base64" | "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpResolutions_WithWebp_TracedSvgFragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "tracedSVG" | "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpResolutions_NoBase64Fragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "width" | "height" | "src" | "srcSet"
>

export type GatsbyImageSharpResolutions_WithWebp_NoBase64Fragment = { __typename?: "ImageSharpResolutions" } & Pick<
  ImageSharpResolutions,
  "width" | "height" | "src" | "srcSet" | "srcWebp" | "srcSetWebp"
>

export type GatsbyImageSharpSizesFragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "base64" | "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpSizes_TracedSvgFragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "tracedSVG" | "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpSizes_WithWebpFragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "base64" | "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GatsbyImageSharpSizes_WithWebp_TracedSvgFragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "tracedSVG" | "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GatsbyImageSharpSizes_NoBase64Fragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "aspectRatio" | "src" | "srcSet" | "sizes"
>

export type GatsbyImageSharpSizes_WithWebp_NoBase64Fragment = { __typename?: "ImageSharpSizes" } & Pick<
  ImageSharpSizes,
  "aspectRatio" | "src" | "srcSet" | "srcWebp" | "srcSetWebp" | "sizes"
>

export type GearIconsQueryVariables = {}

export type GearIconsQuery = { __typename?: "Query" } & {
  allFile: { __typename?: "FileConnection" } & {
    edges: Array<
      { __typename?: "FileEdge" } & {
        node: { __typename?: "File" } & Pick<File, "name"> & {
            childImageSharp?: Maybe<
              { __typename?: "ImageSharp" } & {
                fixed?: Maybe<{ __typename?: "ImageSharpFixed" } & GatsbyImageSharpFixedFragment>
              }
            >
          }
      }
    >
  }
}

export type ShipImagesQueryVariables = {}

export type ShipImagesQuery = { __typename?: "Query" } & {
  allFile: { __typename?: "FileConnection" } & {
    edges: Array<
      { __typename?: "FileEdge" } & {
        node: { __typename?: "File" } & Pick<File, "name"> & {
            childImageSharp?: Maybe<
              { __typename?: "ImageSharp" } & {
                fixed?: Maybe<{ __typename?: "ImageSharpFixed" } & GatsbyImageSharpFixed_WithWebpFragment>
              }
            >
          }
      }
    >
  }
}

export type StatIconsQueryVariables = {}

export type StatIconsQuery = { __typename?: "Query" } & {
  allFile: { __typename?: "FileConnection" } & {
    edges: Array<
      { __typename?: "FileEdge" } & {
        node: { __typename?: "File" } & Pick<File, "name"> & {
            childImageSharp?: Maybe<
              { __typename?: "ImageSharp" } & {
                fixed?: Maybe<{ __typename?: "ImageSharpFixed" } & GatsbyImageSharpFixedFragment>
              }
            >
          }
      }
    >
  }
}

export type ProficiencyIconsQueryVariables = {}

export type ProficiencyIconsQuery = { __typename?: "Query" } & {
  allFile: { __typename?: "FileConnection" } & {
    edges: Array<
      { __typename?: "FileEdge" } & {
        node: { __typename?: "File" } & Pick<File, "name"> & {
            childImageSharp?: Maybe<
              { __typename?: "ImageSharp" } & {
                fluid?: Maybe<{ __typename?: "ImageSharpFluid" } & GatsbyImageSharpFluidFragment>
              }
            >
          }
      }
    >
  }
}

export type FilterIconsQueryVariables = {}

export type FilterIconsQuery = { __typename?: "Query" } & {
  allFile: { __typename?: "FileConnection" } & {
    edges: Array<
      { __typename?: "FileEdge" } & {
        node: { __typename?: "File" } & Pick<File, "name"> & {
            childImageSharp?: Maybe<
              { __typename?: "ImageSharp" } & {
                fixed?: Maybe<{ __typename?: "ImageSharpFixed" } & GatsbyImageSharpFixedFragment>
              }
            >
          }
      }
    >
  }
}
