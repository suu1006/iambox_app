import HomeIcon from '../assets/nav-home.svg';
import LocationIcon from '../assets/nav-location.svg';
import EntryQrIcon from '../assets/nav-entry-qr.svg';
import MovingBoxIcon from '../assets/nav-moving-box.svg';
import MyIcon from '../assets/nav-my.svg';

export const tabs = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'locations', label: '지점찾기', Icon: LocationIcon },
  { key: 'access', label: '출입QR', Icon: EntryQrIcon },
  { key: 'items', label: '이삿짐', Icon: MovingBoxIcon },
  { key: 'my', label: '마이', Icon: MyIcon },
] as const;

export type TabKey = (typeof tabs)[number]['key'];
