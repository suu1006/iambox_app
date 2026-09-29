# Mobile

React Native + Expo + TypeScript 기본 앱입니다. 현재 화면 하나만 표시합니다.
Expo SDK 57의 공식 `blank-typescript` 템플릿을 기반으로 합니다.

## 실행

프로젝트 루트에서 실행합니다.

```bash
pnpm install
pnpm dev:mobile --port 8082
```

1. 휴대폰에 프로젝트 SDK 57과 호환되는 Expo Go를 설치합니다.
2. 휴대폰과 컴퓨터를 같은 Wi-Fi에 연결합니다.
3. Android는 Expo Go의 QR 스캔, iPhone은 카메라로 터미널의 QR 코드를 엽니다.
4. 흰 화면 중앙에 `iambox 앱 실행 성공`이 표시되는지 확인합니다.
5. `mobile/App.tsx`의 문구를 바꾸고 저장하면 화면에 반영되는지 확인합니다.
6. 개발 서버는 터미널에서 `Ctrl+C`로 종료합니다.

iOS에서 Expo 계정 로그인을 요구하면 컴퓨터에서
`pnpm --filter @iambox/mobile exec expo login`을 실행하고,
휴대폰 Expo Go에도 같은 계정으로 로그인합니다.
SDK 호환 오류는 [Expo Go 안내](https://expo.dev/go)를 확인하세요.
연결이 안 되면 같은 Wi-Fi인지, VPN이나 방화벽이 연결을 막는지 확인합니다.

## 파일 역할

- `index.ts`: `registerRootComponent(App)`으로 Expo에 시작 화면을 등록합니다.
- `App.tsx`: `View`에 `Text`를 배치하고 `StyleSheet`로 화면 중앙 정렬을 지정합니다.
- `app.json`: 앱 이름, 화면 방향, 아이콘 등 Expo 설정입니다.
- `assets/`: 템플릿의 기본 앱 아이콘 이미지입니다.
- `package.json`: 모바일 앱 의존성과 실행·타입 검사 명령입니다.
- `tsconfig.json`: Expo 기본 설정을 상속하고 TypeScript strict 검사를 켭니다.
- `LICENSE`: 공식 템플릿의 라이선스입니다.

동작 흐름: Expo → `index.ts` → `App.tsx` → 휴대폰 화면

## 검증

루트에서 타입 오류를 확인합니다. 성공하면 오류 없이 종료됩니다.

```bash
pnpm typecheck:mobile
```

iOS와 Android용 JavaScript 번들을 생성해 모듈 변환을 확인합니다.
이는 네이티브 앱 설치나 실제 휴대폰 화면 확인을 대신하지 않습니다.

```bash
pnpm --filter @iambox/mobile exec expo export --platform ios --platform android
```

생성되는 `mobile/dist/`는 Git 추적 대상에서 제외합니다.

공식 문서: [Expo 프로젝트 생성](https://docs.expo.dev/more/create-expo/)
