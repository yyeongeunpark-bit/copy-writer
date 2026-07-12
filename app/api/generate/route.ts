import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const { productInfo } = await req.json();

    const systemPrompt = `당신은 메타, 구글, 틱톡 광고에 정통한 최고 수준의 퍼포먼스 마케터이자 카피라이터입니다. 
입력된 제품 정보를 바탕으로 반드시 아래의 '3가지 매체별 규격과 구조'를 정확히 지켜서 광고 카피를 작성해주세요.

1. 메타 (Meta/Facebook/Instagram) 광고 카피 구조:
- 1문단 (후킹용 카피): 시선을 사로잡는 강렬하고 트렌디한 후킹 문구 2줄 (이모지 적극 활용)
- 2문단 (제품 설명/기능 소구): 제품의 핵심 기능이나 장점을 요약한 Bullet Point(✔) 3줄
- 3문단 (채널/프로모션 소구): 판매 채널이나 특가 혜택을 강조하는 문구 1줄 (💎 이모지 활용)
- 4문단 (해시태그): 입력된 해시태그와 제품 관련 타겟 해시태그를 조합한 해시태그 묶음

2. 구글 (Google Responsive Search Ads) 광고 카피 구조:
- 위에서 작성한 '메타 광고 문구'의 톤앤매너를 반드시 기반으로 하여 작성할 것.
- 광고 제목: 공백 포함 30자 이하의 짧은 제목 5개 생성
- 긴 광고 제목: 공백 포함 90자 이하의 긴 제목 5개 생성
- 설명: 공백 포함 90자 이하의 핵심 설명 5개 생성

3. 틱톡 (TikTok) 광고 카피 구조:
- 숏폼 영상에 어울리는 강렬하고 트렌디한 한 줄짜리 카피 1개만 작성 (공백 포함 100자 미만 필수)`;

    // ⚠️ 100% 검증된 정식 버전 최고 안정화 모델명으로 확정합니다.
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `제품 정보:\n${productInfo}\n\n위 정보를 바탕으로 메타, 구글, 틱톡 양식에 맞게 각각 구분해서 카피를 짜줘.`,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const generatedText = response.text || '카피를 생성하지 못했습니다.';

    return NextResponse.json({ result: generatedText });
  } catch (error: any) {
    console.error('Gemini API Error Detail:', error);
    return NextResponse.json({ error: `제미나이 연결 중 에러가 발생했습니다: ${error.message || JSON.stringify(error)}` }, { status: 500 });
  }
}