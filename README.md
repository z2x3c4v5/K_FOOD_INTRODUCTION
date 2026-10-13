# K-FOOD · I'd like to introduce ___ to you. · 한국 음식 소개하기

6학년 영어 **음식 소개하기** 활동용 웹앱입니다.
**다양한 한국 음식(K-FOOD) 34가지**를 영어 이름과 한글 이름으로 함께 보고,
그 음식에 **정말 들어가는 재료**와 **어울리는 맛**을 골라 아래 형식의 소개글을 완성한 뒤 영어로 발표합니다.

## 소개글 형식 (워크시트)

```
Hello. I'm ________.
I'd like to introduce (음식) to you.
(음식) is Korean food.
It is (둘러보기에서 고른 소개 문장 · 초급/중급).
It has (재료들).
You can choose (선택 1) or (선택 2).   ← 골라 먹을 수 있는 것 (2개 고르면 들어감)
It's (맛).
Would you like this (음식)? Bye.
```

예) `Hello. I'm Minsu. I'd like to introduce tteokbokki to you. Tteokbokki is Korean food. It is rice cakes in a spicy red sauce. It has rice cakes, fish cakes, and gochujang. You can choose cheese or ramyeon noodles. It's spicy and sweet. Would you like this tteokbokki? Bye.`

## 기능 (탭 3개: 둘러보기 → 재료·맛 고르기 → 내가 고른 문장들 연습하기)

- 🍱 **K-FOOD 둘러보기** — 한국 음식 **34가지** 카드. **실제 음식 사진**(인터넷 연결 시 영어 위키백과 대표 사진을 자동으로 가져옴 → 없으면 AI 사진 → 그래도 없으면 이모지, 🖼️ 사진/😀 이모지 전환 가능) + 영어 이름 + 한글 이름 + 한 줄 설명(영어·한글). 설명 문장은 **초급**(짧고 쉬운 문장) / **중급**(조금 더 자세한 문장) 중 고를 수 있음. 이름·설명 문장은 옆의 🔊로 **문장 전체** 듣기, 영어 **단어를 누르면 그 단어만** 들리고 뜻 풍선이 뜸
  - 🍚 밥: Bibimbap · Gimbap · Kimchi fried rice · Gyeran-bap
  - 🍲 국·찌개: Kimchi jjigae · Doenjang jjigae · Sundubu jjigae · Samgyetang · Tteokguk · Miyeokguk
  - 🍜 면: Japchae · Naengmyeon · Kalguksu · Jajangmyeon · Ramyeon
  - 🥩 고기·반찬: Bulgogi · Galbi · Samgyeopsal · Kimchi · Pajeon · Dakgalbi · Korean fried chicken
  - 🍢 분식·간식: Tteokbokki · Mandu · Eomuk · Hotteok · Bungeoppang · Gyeran-ppang · Dalgona
  - 🍧 디저트·음료: Bingsu · Songpyeon · Yakgwa · Sikhye · Sujeonggwa
  - **👉 이 음식 소개하기**를 누르면 그 음식으로 재료·맛 고르기로 넘어감
- 🥕 **재료 · 맛 고르기** — 위쪽에 고른 음식의 이름·영어 설명·한글 설명이 그대로 보임(🔊·단어 뜻). **정말 들어가는 재료**만 보여 주고 그중 **2~4개**를 고름 → `It has ___.`
  - 🧩 **재료 퀴즈**: 다른 음식의 재료 3개 + 엉뚱한 재료(초콜릿·케첩 등) 2개를 섞어 보여 줌. **들어가지 않는 재료를 누르면 ❌ 안내가 나오고 소개글에 들어가지 않음**
  - **골라 먹을 수 있는 것**(토핑·바꿀 수 있는 재료·모양 등) 중 **2개**를 고름 → `You can choose ___ or ___.` (안 고르면 이 문장은 빠짐)
  - 음식마다 어울리는 **맛** 중 **1~2개**를 고름 → `It's ___.` (맛 20가지: spicy · sweet · salty · sour · savory · nutty · hot · warm · cold · refreshing · crispy · crunchy · chewy · soft · juicy · mild · rich · fresh · healthy · delicious)
  - 고를 때마다 영어 문장 + 한글 뜻이 바로 채워지고 읽어 줌 · 🎲 무작위 채우기
- 🎤 **내가 고른 문장들 연습하기** — 둘러보기에서 고른 음식·소개 문장(초급/중급), 재료·골라 먹기·맛 문장이 한 편의 소개글(**7~8줄**)로 모임. 줄마다 어떤 문장인지 표시(🍱 음식 · 📖 소개 문장 · 🥕 재료 · 🔀 골라 먹기 · 😋 맛). 이름(영어)을 쓰면 완성. 줄마다 🔊 듣기와 🎙️ 말하기 정확도 측정, **🎭 처음부터 끝까지 말하기**(첫 줄부터 차례로 마이크가 켜지고 끝나면 점수) · 👫 **짝에게 소개하기** 카드(친구 대답: Yes, please. / No, thanks.)
- 말하기 **속도 조절** 슬라이더 · 로마자 음식 이름(tteokbokki 등)은 영어 음성이 비슷하게 읽도록 발음을 바꿔 읽음

브라우저 내장 **Web Speech API**(음성 합성·음성 인식)를 사용합니다. (Chrome 권장)
음식 사진은 **Wikipedia · Wikimedia Commons**의 자유 이용 사진(각 문서 대표 사진)을 브라우저에서 바로 불러오며, 한 번 받은 사진 주소는 브라우저에 저장됩니다. 인터넷이 없으면 이모지로 보입니다.
고른 음식·재료·맛·이름과 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·K-FOOD 테마 |
| `data.js`    | 음식 34가지(이름·설명 초급/중급·재료·골라 먹기·맛), 재료·선택지·맛 사전, 단어 뜻 사전 |
| `app.js`     | 둘러보기·재료/맛 고르기·내가 고른 문장들 연습하기·음성 기능 |
| `worksheet_친구초대하기.hwpx` | (이전 단원 '친구 초대하기' 워크시트 · 이 앱과는 관계없음) |

## 음식·재료 추가하기

`data.js`의 `FOODS` 배열에 항목을 추가하면 됩니다. `ingredients`는 `INGREDIENTS`의 `en`, `options`는 `INGREDIENTS` 또는 `CHOICES`의 `en`, `tastes`는 `TASTES`의 `en` 값을 씁니다.
설명 문장은 `desc.beginner`(초급)와 `desc.intermediate`(중급)에 영어·한글을 각각 쓰고, `wiki`에는 사진을 가져올 영어 위키백과 문서 제목을 적습니다(앞에서부터 차례로 시도). 새 재료는 `INGREDIENTS`에, 음식 이름의 영어 발음은 `SAY_MAP`에 넣어 주세요.
