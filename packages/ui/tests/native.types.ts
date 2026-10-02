import type { ButtonProps, BadgeProps } from '@iambox/ui/native';
const button: ButtonProps = { label: '확인', disabled: null, onPress: event => { void event.nativeEvent.pageX; }, className: 'flex-1', accessibilityHint: '안내 열기' };
const badge: BadgeProps = { label: 'M', tone: 'neutral', size: 'compact' };
// @ts-expect-error native 진입점은 DOM 이벤트를 받지 않는다.
const mixed: ButtonProps = { label: '확인', onClick: () => {} };
void [button, badge, mixed];
