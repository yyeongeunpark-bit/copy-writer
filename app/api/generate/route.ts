import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { productInfo } = await req.json();

    // 3개 매체의 규칙을 한 번에 AI에게 주입하는 강력한 프롬프트입니다.
    const systemPrompt = `당신은 메타, 구글, 틱톡 광고에 정통한 최고 수준의 퍼포먼스 마케터이자 카피라이터입니다. 
입력된 제품 정보를 바탕으로 반드시 아래의 '3가지 매체별 규격과 구조'를 정확히 지켜서 광고 카피를 작성해주세요.

1. 메타 (Meta/Facebook/Instagram) 광고 카피 구조:
- 1문단 (후킹용 카피): 시선을 사로잡는 강렬한 후킹 문구 2줄 (이모지 활용 적극 권장)
- 2문단 (제품 설명/기능 소구): 제품의 핵심 기능이나 장점을 요약한 Bullet Point(✔) 3줄
- 3문단 (채널/프로모션 소구): 판매 채널(예: CJ온스타일 등)이나 특가 혜택을 강조하는 문구 1줄 (💎 이모지 활용)
- 4문단 (해시태그): 입력된 해시태그와 제품 관련 타겟 해시태그를 조합한 해시태그 묶음

2. 구글 (Google Responsive Search Ads) 광고 카피 구조:
- 위에서 작성한 '메타 광고 문구'의 톤앤매너를 반드시 기반으로 하여 작성할 것.
- 광고 제목: 공백 포함 30자 이하의 짧은 제목 5개 생성
- 긴 광고 제목: 공백 포함 90자 이하의 긴 제목 5개 생성
- 설명: 공백 포함 90자 이하의 핵심 설명 5개 생성

3. 틱톡 (TikTok) 광고 카피 구조:
- 숏폼 영상에 어울리는 강렬하고 트렌디한 한 줄짜리 카피 1개만 작성 (공백 포함 100자 미만 필수)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `제품 정보:\n${productInfo}\n\n위 정보를 바탕으로 메타, 구글, 틱톡 양식에 맞게 각각 구분해서 카피를 짜줘.` }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: '카피 생성 중 에러가 발생했습니다.' }, { status: 500 });
  }
}