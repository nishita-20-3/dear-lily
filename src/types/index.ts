export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  coverImage: string;
  bio: string;
  birthday: string;
  joinDate: string;
  favoriteTheme: string;
  isAuth: boolean;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface RegisteredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  birthday?: string;
  joinDate?: string;
  favoriteTheme?: string;
  role?: 'admin' | 'user';
  isAdmin?: boolean;
}

export interface StickerItem {
  id: string;
  content: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  stickerType?: 'image' | 'emoji';
  imageSrc?: string;
}

export interface TextOverlayItem {
  id: string;
  text: string;
  x: number;
  y: number;
  font: string;
  color: string;
  size: number;
  curved: boolean;
  shadow: boolean;
}

export interface PhotoStrip {
  id: string;
  userId: string;
  userEmail?: string;
  createdAt: string;
  title: string;
  layout: '3-strip' | '4-strip';
  photos: string[];
  filter: string;
  frame: string;
  paperBg: string;
  stickers: StickerItem[];
  textOverlays: TextOverlayItem[];
  albumId?: string;
  isFavorite?: boolean;
}

export type PaperStyle = 'lined' | 'dot' | 'grid' | 'blank' | 'vintage' | 'kraft' | 'floral' | 'pastel';

export type DiaryTheme = 
  | 'Vintage Notebook'
  | 'Floral Journal'
  | 'Minimal'
  | 'Cottagecore'
  | 'Fairy'
  | 'Coffee Journal'
  | 'Korean Journal'
  | 'Cloud Theme'
  | 'Galaxy'
  | 'Autumn'
  | 'Spring'
  | 'Summer'
  | 'Winter'
  | 'Scrapbook';

export interface DiaryEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  folder?: string;
  mood: string;
  weather?: string;
  tags?: string[];
  theme?: DiaryTheme;
  paperStyle?: PaperStyle | string;
  isFavorite?: boolean;
  isDraft?: boolean;
  pinLocked?: boolean;
  isLocked?: boolean;
  pinCode?: string;
  stickers?: any[];
  fontFamily?: string;
  font?: string;
  titleFont?: string;
  contentFont?: string;
  titleColor?: string;
  contentColor?: string;
  titleSize?: string;
  contentSize?: string;
  createdAt?: string;
}

export interface Album {
  id: string;
  userId: string;
  name: string;
  description: string;
  coverImage?: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  cursorSparkles: boolean;
  clickEffects: boolean;
  themeColor: string;
}
