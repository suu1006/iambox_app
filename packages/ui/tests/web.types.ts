import type { ButtonProps, BadgeProps } from '@iambox/ui/web';
const button: ButtonProps = { label: '확인', onClick: event => { void event.currentTarget.disabled; }, type: 'button', accessibilityLabel: '보관 신청' };
const badge: BadgeProps = { label: 'M', tone: 'neutral', size: 'compact', 'aria-label': 'M 사이즈' };
// @ts-expect-error web 진입점은 네이티브 이벤트를 받지 않는다.
const mixed: ButtonProps = { label: '확인', onPress: () => {} };
void [button, badge, mixed];
