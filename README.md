# What would you like? · I'd like K-food. · 한식 한 상

6학년 영어 **음식 소개하기** 활동용 웹앱입니다.
**다양한 한국 음식(K-FOOD) 34가지**를 영어 이름과 한글 이름으로 함께 보고,
그 음식에 **정말 들어가는 재료**와 **어울리는 맛**을 골라 아래 문장들을 완성한 뒤 영어로 말하기 연습을 합니다.

## 연습하는 문장 (워크시트)

```
(고른 음식 설명을 주어·동사가 있는 완전한 문장으로 연습 · 초급/중급)
It has (재료들).
You can choose (선택 1) or (선택 2).   ← 골라 먹을 수 있는 것 (2개 고르면 들어감)
It's (맛).
```

예) `Tteokbokki is a rice cake dish with a spicy red sauce. It has rice cakes, fish cakes, and gochujang. You can choose cheese or ramyeon noodles. It's spicy and sweet.`

## 기능 (탭 3개: 둘러보기 → 재료·맛 고르기 → 내가 고른 문장들 연습하기)

- 🍱 **K-FOOD 둘러보기** — 한국 음식 **34가지** 카드. **실제 음식 사진**(34개 모두 `assets/foods/`에 JPEG 파일로 포함, 외부 API·AI 생성·이모지 대체 없음) + 영어 이름 + 한글 이름 + 한 줄 설명(영어·한글). 설명 문장은 **초급**(짧고 쉬운 문장) / **중급**(조금 더 자세한 문장) 중 고를 수 있음. 이름·설명 문장은 옆의 🔊로 **문장 전체** 듣기, 영어 **단어를 누르면 그 단어만** 들리고 뜻 풍선이 뜸
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
- 🎤 **내가 고른 문장들 연습하기** — 고른 **소개 문장(초급/중급)**, **It has ~.**, **You can choose ~ or ~.**, **It's ~.** 네 문장만 모아 연습. 줄마다 어떤 문장인지 표시(📖 소개 문장 · 🥕 재료 · 🔀 골라 먹기 · 😋 맛), 🔊 듣기와 🎙️ 말하기 정확도 측정, **🎭 처음부터 끝까지 말하기**(첫 줄부터 차례로 마이크가 켜지고 끝나면 점수)
- 말하기 **속도 조절** 슬라이더 · 로마자 음식 이름(tteokbokki 등)은 영어 음성이 비슷하게 읽도록 발음을 바꿔 읽음

브라우저 내장 **Web Speech API**(음성 합성·음성 인식)를 사용합니다. (Chrome 권장)
음식 사진 34개는 앱과 함께 배포됩니다. 사진별 저작자·라이선스·원본 링크·변경 사항은 `photo-credits.html`과 `assets/foods/credits.json`에 기록되어 있으며, 각 카드의 **사진 출처**에서 확인할 수 있습니다.
고른 음식·재료·맛과 연습 기록은 브라우저(localStorage)에 저장됩니다.

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
설명 문장은 `desc.beginner`(초급)와 `desc.intermediate`(중급)에 영어·한글을 각각 쓰고, `assets/foods/<key>.jpg`에 실제 사진을 추가하고 `assets/foods/credits.json` 및 `photo-credits.html`에 저작자·이용 조건을 기재합니다. `wiki`는 사진 갱신 스크립트의 출처 문서 제목입니다. 새 재료는 `INGREDIENTS`에, 음식 이름의 영어 발음은 `SAY_MAP`에 넣어 주세요.

## 사진 갱신

`python scripts/download-food-photos.py`로 출처 manifest에 기록된 사진을 다시 내려받습니다(Node.js, Python, Pillow 필요). 모든 음식은 기존에 선택한 사진을 유지합니다. 사진이나 출처가 바뀌면 `photo-credits.html`도 맞춰 수정해야 합니다.

음식 설명의 `en`은 둘러보기용 짧은 설명이고, `practiceEn`은 듣기·말하기 연습용 완전한 문장입니다. 초급·중급 모두 `practiceEn`을 작성해야 합니다. 복수 음식명(Mandu, Songpyeon)은 `are`를 사용합니다.

## 디자인

한지색 바탕, 청자 녹색과 고추장 적색, 전통 창살 문양을 사용한 한식 한 상 디자인입니다. 상단에서 `What would you like?` / `I’d like K-food.`와 실제 음식으로 답하는 `I’d like bibimbap.` 예시를 보여 줍니다. 메뉴·재료·말하기의 3단계 흐름, 34개 실제 사진, 완전한 문장 연습은 그대로 제공됩니다.
