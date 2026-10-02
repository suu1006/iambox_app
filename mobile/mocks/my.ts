import type { DialogContent } from '../components/ui/Dialog';

// 화면 확인용 안내. 실제 계정·예약·결제·약관 데이터로 사용하지 않는다.
export const mockMyDialogs = {
  settings: { title: '설정', description: '설정 기능을 준비하고 있어요.' },
  profile: {
    title: '내 정보 관리',
    description: '보관고객님',
    lines: ['현재는 화면 확인용 프로필입니다. 회원 정보 조회와 수정은 서비스 연결 후 제공됩니다.'],
  },
  payments: {
    title: '결제 내역',
    description: '결제 내역을 준비하고 있어요.',
    lines: ['실제 결제 정보는 결제 서비스 연결 후 확인할 수 있습니다.'],
  },
  notifications: {
    title: '알림설정',
    description: '알림설정 기능을 준비하고 있어요.',
    lines: ['현재는 알림 권한을 요청하거나 기기의 알림 설정을 변경하지 않습니다.'],
  },
  delivery: { title: '택배예약', description: '택배예약 서비스를 준비하고 있어요.' },
  reservation: { title: '사전예약', description: '사전예약 서비스를 준비하고 있어요.' },
  care: { title: '케어서비스', description: '소중한 물품을 위한 케어서비스를 준비하고 있어요.' },
  notices: { title: '공지사항', description: '공지사항을 준비하고 있어요.' },
  faq: {
    title: 'FAQ',
    description: '자주 묻는 질문',
    lines: ['이용 중인 보관 공간은 나의 박스에서 확인할 수 있어요.', '출입 방법은 출입QR 화면의 출입 방법 안내를 확인해 주세요.'],
  },
  terms: {
    title: '이용약관',
    description: '정식 이용약관을 준비하고 있어요.',
    lines: ['이 창은 약관 표시 화면의 예시입니다. 실제 약관 본문은 서비스 운영 정책이 확정된 후 제공됩니다.'],
  },
  privacy: {
    title: '개인정보처리방침',
    description: '정식 개인정보처리방침을 준비하고 있어요.',
    lines: ['이 창은 개인정보처리방침 표시 화면의 예시입니다. 실제 방침 본문은 서비스 운영 정책이 확정된 후 제공됩니다.'],
  },
  logout: {
    title: '로그아웃',
    description: '현재는 화면 확인용 계정입니다.',
    lines: ['로그인 기능 연결 후 로그아웃할 수 있습니다. 현재 변경되는 로그인 상태는 없습니다.'],
  },
} satisfies Record<string, DialogContent>;
