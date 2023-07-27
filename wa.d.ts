export interface Payload {
  key?: Key;
  messageTimestamp: number;
  pushName?: string;
  broadcast?: boolean;
  message?: Message;
  verifiedBizName?: string;
  status: "PENDING" | number;
  messageStubType?: number;
  messageStubParameters?: string[];
  participant?: string;
  userReceipt?: UserReceipt[];
  reactions?: Reaction[];
}

export interface UserReceipt {
  userJid: string;
  readTimestamp: number;
}

export interface Reaction {
  key: Key;
  text: string;
  senderTimestampMs: {
    low: number;
    high: number;
    unsigned: boolean;
  };
}

export interface Key {
  remoteJid: string;
  fromMe: boolean;
  id: string;
  participant?: string;
}

export interface Message {
  documentMessage?: DocumentMessage;
  documentWithCaptionMessage?: {
    message: Message;
  };
  conversation?: string;
  extendedTextMessage?: ExtendedTextMessage;
  imageMessage?: ImageMessage;
  reactionMessage?: ReactionMessage;
  stickerMessage?: StickerMessage;
}

export interface DocumentMessage {
  url: string;
  mimetype: string;
  title?: string;
  fileSha256: string;
  fileLength: string;
  pageCount?: number;
  mediaKey: string;
  fileName: string;
  fileEncSha256: string;
  directPath: string;
  mediaKeyTimestamp: string;
  thumbnailDirectPath?: string;
  thumbnailSha256?: string;
  thumbnailEncSha256?: string;
  jpegThumbnail?: string;
  contextInfo?: ContextInfo;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
  contactVcard?: boolean;
  caption?: string;
}

export interface ImageMessage {
  url: string;
  mimetype: string;
  fileSha256: string;
  fileLength: string;
  height: number;
  width: number;
  mediaKey: string;
  fileEncSha256: string;
  directPath: string;
  mediaKeyTimestamp: string;
  jpegThumbnail: string;
  contextInfo?: ContextInfo;
  caption?: string;
  viewOnce?: boolean;
  scansSidecar?: string;
  scanLengths?: number[];
  midQualityFileSha256?: string;
}

export interface ExtendedTextMessage {
  text: string;
  contextInfo?: ContextInfo;
  matchedText?: string;
  canonicalUrl?: string;
  description?: string;
  title?: string;
  previewType?: string;
  inviteLinkGroupTypeV2?: string;
  jpegThumbnail?: string;
  thumbnailDirectPath?: string;
  thumbnailSha256?: string;
  thumbnailEncSha256?: string;
  mediaKey?: string;
  mediaKeyTimestamp?: string;
  thumbnailHeight?: number;
  thumbnailWidth?: number;
}

export interface ContextInfo {
  stanzaId?: string;
  participant?: string;
  quotedMessage?: Message;
  expiration?: number;
  forwardingScore?: number;
  isForwarded?: boolean;
  disappearingMode?: {
    initiator: string;
  };
  mentionedJid?: string[];
  ephemeralSettingTimestamp?: string;
}

export interface ReactionMessage {
  key: Key;
  text: string;
  senderTimestampMs: string;
}

export interface StickerMessage {
  url: string;
  fileSha256: string;
  fileEncSha256: string;
  mediaKey: string;
  mimetype: string;
  directPath: string;
  fileLength: string;
  mediaKeyTimestamp: string;
  isAnimated: boolean;
  stickerSentTs: string;
  isAvatar: boolean;
  height?: number;
  width?: number;
  contextInfo?: ContextInfo;
}
