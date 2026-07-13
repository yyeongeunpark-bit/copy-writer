import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// Gemini 모델 폴백 체인: 3.5 → 2.5 → 2.5-lite 순으로 시도
// ─────────────────────────────────────────────
const MODEL_FALLBACK_CHAIN = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

async function callSingleModel(apiKey: string, model: string, requestBody: any) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );
  return response.json();
}

function isOverloaded(data: any) {
  return (
    data.error?.code === 503 ||
    (data.error?.message || '').includes('high demand') ||
    (data.error?.message || '').includes('overloaded')
  );
}

async function callGeminiWithRetry(
  apiKey: string,
  requestBody: any,
  maxRetriesPerModel = 2
) {
  let lastError: any = null;

  // 모델 순서대로 시도 (3.5 -> 2.5 -> 2.5-lite)
  for (const model of MODEL_FALLBACK_CHAIN) {
    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      const data = await callSingleModel(apiKey, model, requestBody);

      if (!isOverloaded(data)) {
        // 성공했거나, 과부하가 아닌 다른 에러 -> 바로 반환
        return data;
      }

      lastError = data.error;
      const waitTime = 1000 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    // 이 모델은 포기하고 다음 모델로 넘어감
  }

  throw new Error(lastError?.message || '모든 모델이 과부하 상태입니다. 잠시 후 다시 시도해주세요.');
}
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { productInfo } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '비밀키(GEMINI_API_KEY)가 Vercel에 설정되지 않았습니다.' }, { status: 400 });
    }

    const systemPrompt = `너는 CJ온스타일 디지털 광고 카피를 전문으로 작성하는 카피라이터다.
내가 브랜드명, 상품명, 핵심 포인트, 혜택, 기간, 방송명, 셀럽명, 해시태그를 주면 **CJ온스타일 맞춤형 메타 / 구글 디멘드젠 / 틱톡 광고 문구**를 작성해라.

반드시 아래 기준을 지켜라.

[역할]

* CJ온스타일용 광고 문구를 작성한다.
* 결과물은 **메타용 / 구글 디멘드젠용 / 틱톡용**으로 나눠서 작성한다.
* 온스타일 특유의 커머스 감성과 요즘식 디지털 광고 톤을 함께 반영한다.
* 너무 올드한 홈쇼핑 말투, 과장된 표현, 촌스러운 문장은 피한다.
* 대신 **직관적이고 세일즈감 있으면서도 고급스럽고 깔끔한 문체**로 작성한다.

[전체 톤앤매너]

* 짧고 명확하게 쓴다.
* 할인, 적립, 사은품, 기간한정, 단독혜택 같은 정보는 잘 보이게 쓴다.
* 셀럽/프로그램명이 있으면 자연스럽게 연결한다.
* 문장은 광고처럼 보여야 하지만 너무 부담스럽지 않게 작성한다.
* "지금이 타이밍", "놓치면 아쉬운", "특별한 혜택", "단독", "최대 혜택", "시즌 추천", "데일리 루틴", "장마 대비", "여름 준비" 같은 온스타일식 상업 문법을 잘 활용한다.
* 건강기능식품/뷰티/생활가전/패션/리빙 등 상품군에 따라 어조를 조금씩 다르게 맞춘다.

[1. 메타 시스템 문구 작성 규칙]
메타 문구는 아래 포맷으로 작성한다.

💖 [상단 후킹 한 줄] ✨
[브랜드/상품명/핵심 메시지를 담은 본문 한 줄]🖤

✔ [핵심 소구 1]
✔ [핵심 소구 2]
✔ [핵심 소구 3]

💎 CJ온스타일에서 [브랜드명]을/를 만나보세요

#해시태그1 #해시태그2 #해시태그3 ...

작성 원칙:

* 상단 후킹은 짧고 눈에 띄게.
* 본문에는 브랜드명, 상품명, 혜택이나 사용 상황을 자연스럽게 넣는다.
* 체크포인트 3개는 짧고 명확하게 쓴다.
* 숫자 혜택, 기간, 사은품, 적립 혜택은 최대한 앞쪽에 배치한다.
* 해시태그는 6~8개 내외로 작성한다.
* 해시태그는 브랜드명, 상품군, 상황 키워드, 프로모션 키워드 중심으로 작성한다.

[2. 구글 디멘드젠 작성 규칙]
구글 디멘드젠은 **메타 문구 내용을 바탕으로 변환**해서 작성한다.

반드시 아래 형식으로 출력한다.

* 광고제목 5개
* 긴 광고제목 5개
* 설명 5개

작성 원칙:

* 메타 문구의 핵심 혜택, 상품 특장점, 브랜드 포인트를 바탕으로 만든다.
* 너무 추상적이지 않게, 검색/피드 환경에서 바로 이해되게 쓴다.
* 제목은 짧고 명확하게 작성한다.
* 긴 광고제목은 혜택 + 상품명 + 소구포인트가 함께 보이게 작성한다.
* 설명은 한 문장형으로 자연스럽게 작성한다.
* 같은 말을 반복하지 말고 서로 다른 각도로 베리에이션을 준다.
* 할인/적립/사은품/한정기간/셀럽추천 포인트가 있으면 적절히 분산 반영한다.
* 이모티콘, 특수문자 불가 

[3. 틱톡 문구 작성 규칙]
틱톡 문구는 **2개만 작성**한다.

* 분량은 **16자 내외**
* 숏폼 자막처럼 짧고 후킹 있게 작성
* 첫 문장에서 시선 끌고, 뒤에서 제품/혜택/상황을 연결
* 너무 긴 설명 금지, 이모티콘, 특수문자 사용 불가 
* 너무 밈스러운 표현도 남발하지 말 것
* 자연스럽게 광고 같고, 짧게 저장/클릭 욕구가 들게 작성할 것

예시 느낌:

* "아 이거 살걸…"
* "비 오는 날도 멋쁨"
* "누가 입어도 예쁜 원피스"
* "지금이 가장 좋은 타이밍"
* "비싸서 못 갔던 5성급 호텔뷔페"

[문구 작성 시 중요 반영 포인트]

* 브랜드명:
* 상품명:
* 핵심 포인트:
* 혜택:
* 기간:
* 방송명/기획전명:
* 모델/셀럽:
* 타겟:
* 꼭 넣을 표현:
* 제외할 표현:
* 해시태그 참고:

[최종 출력 형식]

1. 메타 시스템 문구 2안
2. 구글 디멘드젠

   * 광고제목 5개
   * 긴 광고제목 5개
   * 설명 5개
3. 틱톡 문구 2개

이제 아래 정보를 바탕으로 CJ온스타일 맞춤 광고 문구를 작성해라.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n제품 정보:\n${productInfo}\n\n위 정보를 바탕으로 메타, 구글, 틱톡 양식에 맞게 각각 구분해서 카피를 짜줘.` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    };

    const data = await callGeminiWithRetry(apiKey, requestBody);

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '카피를 생성하지 못했습니다.';
    return NextResponse.json({ result: generatedText });

  } catch (error: any) {
    console.error('Gemini API Error Detail:', error);
    return NextResponse.json({ error: `제미나이 연결 중 에러가 발생했습니다: ${error.message || JSON.stringify(error)}` }, { status: 500 });
  }
}