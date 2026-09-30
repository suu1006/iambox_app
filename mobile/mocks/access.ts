// 출입QR 화면 확인용 데이터. 실제 계약·출입 권한과 연결되지 않는다.
export const mockStorageUsage = {
  branchName: '성수점',
  unitNumber: 'A-024',
  size: 'M',
  floor: '1층',
  status: '이용 중',
  startsAt: '2026.09.15',
  endsAt: '2026.10.14',
  // 시안과 동일하게 표시하기 위한 2026.09.30 기준 고정 값이다.
  remainingDays: 14,
};

export const mockAccessDetails = {
  qr: {
    title: '출입 QR',
    description: '성수점 · A-024',
    lines: ['출입 QR을 준비하고 있어요.', '현재는 화면 확인용 예시입니다. 실제 출입용 QR은 서비스 연결 후 표시됩니다.'],
  },
  history: {
    title: '이용 내역',
    description: '화면 확인용 이용 내역입니다.',
    lines: [
      `${mockStorageUsage.branchName} · ${mockStorageUsage.unitNumber} · ${mockStorageUsage.size} 사이즈`,
      `${mockStorageUsage.startsAt} – ${mockStorageUsage.endsAt}`,
      `${mockStorageUsage.status} · 남은 기간 ${mockStorageUsage.remainingDays}일`,
    ],
  },
  location: {
    title: '지점 위치 · 길찾기',
    description: '성수점 방문 안내 예시',
    lines: ['성수역에서 도보 5분 거리에 있어요.', '정확한 주소와 지도 길찾기는 지점 정보 연결 후 제공됩니다.'],
  },
  guide: {
    title: '출입 방법 안내',
    description: '보관 공간 이용 순서',
    lines: ['1. 이용 중인 지점과 보관함 번호를 확인해 주세요.', '2. 출입 QR을 열어 지점 입구의 리더기에 보여 주세요.', '3. 이용 후 보관함과 출입문이 닫혔는지 확인해 주세요.'],
  },
  support: {
    title: '문의하기',
    description: '도움이 필요하신가요?',
    lines: ['문의하실 때 지점명과 보관함 번호를 알려 주세요.', '고객센터 연결은 준비 중입니다. 현재 화면에서는 문의가 접수되지 않습니다.'],
  },
};
