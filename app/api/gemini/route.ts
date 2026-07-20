import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const MODEL_FALLBACK_CHAIN = ['gemini-2.5-flash', 'gemini-3.5-flash'];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: '비밀키(GEMINI_API_KEY)가 설정되지 않았습니다.' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const rawContent = body.brandName || body.productInfo || '';

    const systemPrompt = `
너는 CJ온스타일 디지털 광고 카피를 전문으로 쓰는 시니어 카피라이터다.
사용자가 준 기획 정보를 바탕으로 실제 집행 가능한 메타 / 구글 디멘드젠 / 틱톡 광고 문구를 작성해라.
중요한 건 예쁘게 쓰는 것이 아니라 온스타일스럽고, 상품이 잘 팔리게, 실제 광고 세팅에 바로 넣을 수 있게 쓰는 것이다.

[중요 지시사항]
이전 대화나 기획 내용(예: 서현, 니트, 달바, 미스트 등)은 현재 요청과 아무런 상관이 없으므로 완전히 잊어라.
오직 아래 제공된 [입력 정보]에 적힌 텍스트만을 분석하여 카피를 작성해야 한다. 절대로 없는 브랜드나 상품을 지어내지 말 것.

1. 기본 톤앤매너
- CJ온스타일 특유의 커머스 감성 + 디지털 광고 톤을 함께 반영한다.
- 지나치게 과장된 표현, 부자연스러운 템플릿 문장은 피하고 직관적이고 깔끔하게 쓴다.
- 숫자 혜택, 기간, 적립, 사은품, 단독혜택은 중요도 높게 반영한다.
- 너무 길지 않고 간략하게 작성한다 

2. 메타 문구 작성 방식 (최소 2안 작성, 완전히 다른 결로 변주)
💖 후킹 한 줄 ✨
브랜드/상품/핵심 메시지를 담은 본문 한 줄🖤
✔ 핵심 소구 1
✔ 핵심 소구 2
✔ 핵심 소구 3
💎 CJ온스타일에서 만나보세요
#CJ온스타일 #행사명(문구참고해서 넣어야하고 행사 없으면 생략) #브랜드명

3. 구글 디멘드젠 작성 방식
- 광고제목 5개 / 긴 광고제목 5개 / 설명 5개
- 이모티콘, 특수문자 사용 금지. 같은 단어 반복 최소화. 
- 다만 할인율 소구를 위한 % 사용은 가능 (퍼센트, 일플러스일 이런 AI가 쓴 것 같은 문구 지양)
- 90BYTES 넘지 않게 제작한다 

4. 틱톡 문구 작성 방식
- 틱톡 문구 1개 (100자 내외로 숏폼 영상 본문/자막용 한 문단 카피)
- CJ온스타일 과 브랜드명을 포함해서 제작한다 

5. 절대 하지 말 것
- 대괄호 placeholder 스타일 문장 쓰지 말 것
- 의미 없는 상투어 반복 금지

6. 입력 정보
${rawContent}

7. 최종 출력 형식
아래 구분자 양식을 엄격히 지켜 결과를 작성한다. 다른 부연 설명이나 인사말은 생략한다.

===META1===
(여기에 메타 1안 작성)

===META2===
(여기에 메타 2안 작성)

===GOOGLE_DEMANDGEN===
(여기에 광고제목 5개, 긴 광고제목 5개, 설명 5개 작성)

===TIKTOK===
(여기에 틱톡 문구 작성)
`;

    let generatedText = '';
    let lastError: any = null;

    for (const model of MODEL_FALLBACK_CHAIN) {
      let success = false;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: model,
            contents: systemPrompt,
            config: { temperature: 0.5 }
          });

          if (response && response.text) {
            generatedText = response.text;
            success = true;
            break;
          }
        } catch (err: any) {
          lastError = err;
          const waitTime = 1000 * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
      if (success) break;
    }

    if (!generatedText) {
      throw new Error(lastError?.message || '모든 Gemini 모델 체인이 응답하지 않습니다.');
    }

    return NextResponse.json({ result: generatedText });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
