'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PlatformResult {
  meta1: string;
  meta2: string;
  demandgen: string;
  pmax: string;
  aci: string;
  tiktok: string;
}

interface HistoryItem {
  id: number;
  time: string;
  title: string;
  request: string;
  results: PlatformResult;
}

const initialHistory: HistoryItem[] = [
  {
    id: 1,
    time: "16:10",
    title: "기획전 안 1",
    request: "브랜드명: 닥터포헤어 / 상품명: 폴리젠 샴푸 / 핵심 포인트: 탈모완화 증명, 두피 각질 개선 / 혜택: 단독 35% 할인 + 사은품 증정 / 타겟: 3040 직장인",
    results: {
      meta1: "매일 빠지는 모발로 스트레스받는다면 지금이 타이밍 ✨\n탈모 증상 완화 기능성 검증 완료! 닥터포헤어 폴리젠 샴푸로 두피부터 탄탄하게 케어하세요🖤\n\n✔ 인체 적용 시험으로 증명된 탈모 증상 완화 효과\n✔ 답답한 두피 각질과 유분기까지 시원하게 딥클렌징\n✔ 오직 온스타일에서만 만나는 단독 35% 한정 특가\n\n💎 CJ온스타일에서 닥터포헤어를 만나보세요\n#닥터포헤어 #탈모샴푸 #두피케어 #CJ온스타일 #한정특가",
      meta2: "거울 볼 때마다 휑해진 가르마가 신경 쓰였다면 ✨\n퇴근 후 지친 두피에 주는 완벽한 리프레시, 닥터포헤어 폴리젠 샴푸로 시작하는 건강한 두피 루틴🖤\n\n✔ 3040 직장인들의 무너진 두피 밸런스를 위한 맞춤 솔루션\n✔ 풍성한 거품으로 모근 끝까지 영양을 꽉 채우는 탄력 안심 케어\n\n💎 CJ온스타일에서 닥터포헤어를 만나보세요\n#두피밸런스 #직장인인생템 #샴푸추천 #홈케어루틴",
      demandgen: "광고 제목 5개\n1. 단독 35% 할인 닥터포헤어\n2. 탈모완화 증명 폴리젠 샴푸\n3. CJ온스타일 단독 특가 행사\n4. 직장인 두피 각질 케어 솔루션\n5. 단 3일간 진행되는 한정 혜택\n\n긴 광고 제목 5개\n1. 탈모 완화 기능성 검증 완료 닥터포헤어 폴리젠 샴푸 단독 35% 특가\n2. 3040 직장인 두피 고민 해결사 닥터포헤어 샴푸 사은품 증정 혜택\n3. 두피 각질부터 모근 탄력까지 한 번에 케어하는 폴리젠 샴푸 솔루션\n4. CJ온스타일 단독 구성으로 만나는 닥터포헤어 한정 수량 패키지\n5. 매일 쓰는 샴푸로 시작하는 탈모 예방 건강한 두피 케어 루틴\n\n설명 5개\n1. 인체 적용 시험으로 증명된 탈모 증상 완화 효과를 지금 경험해보세요.\n2. 답답한 두피 각질과 유분기까지 시원하게 딥클렌징하여 모근을 탄탄하게 만듭니다.\n3. 오직 온스타일에서만 만나는 단독 35% 할인 혜택과 특별 사은품을 놓치지 마세요.\n4. 풍성한 영양 거품으로 무너진 두피 밸런스를 바로잡는 직장인 필수 템입니다.\n5. 모발 탄력 개선과 완벽한 두피 리프레시를 선사하는 닥터포헤어 패키지입니다.",
      pmax: "구글 PMAX 규격에 맞게 변환된 카피 필드 영역입니다.",
      aci: "구글 ACI 규격에 맞게 변환된 카피 필드 영역입니다.",
      tiktok: "맨날 빠지는 머리카락 보고 흠칫했다면? 늦기 전에 두피 모근부터 꽉 잡아야 해요! 인체 시험으로 탈모 완화 증명된 닥터포헤어 폴리젠 샴푸, 지금 CJ온스타일 단독 35% 할인에 특별 사은품 구성까지 다 가져가세요!"
    }
  }
];

export default function CopywriterPage() {
  const [requestText, setRequestText] = useState(
    "브랜드명: \n상품명: \n핵심 포인트: \n혜택: \n기간: \n방송명/기획전명: \n셀럽/모델: \n타겟: \n꼭 넣을 표현: \n제외할 표현: \n해시태그 참고: "
  );
  const [resultText, setResultText] = useState<PlatformResult | null>(null);

  // 1. 브라우저가 열릴 때 localStorage에서 영구 기억 히스토리 로드
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('copywriter_history');
      if (savedHistory) {
        try {
          return JSON.parse(savedHistory);
        } catch (e) {
          console.error("히스토리를 불러오는데 실패했습니다.", e);
        }
      }
    }
    return initialHistory;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeGoogleTab, setActiveGoogleTab] = useState<'demandgen' | 'pmax' | 'aci'>('demandgen');

  // 텍스트 영역에서 특정 항목의 값을 파싱하는 헬퍼 함수
  const parseInputField = (text: string, fieldName: string): string => {
    const regex = new RegExp(`${fieldName}\\s*:\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const handleGenerate = async () => {
    if (!requestText.trim()) return alert('브랜드 및 상품 정보를 입력해주세요!');
    setIsLoading(true);

    try {
      // 2. 입력창 텍스트에서 각 항목을 추출하여 백엔드가 원하는 규격(JSON body)으로 조립
      const payload = {
        brandName: parseInputField(requestText, '브랜드명'),
        productName: parseInputField(requestText, '상품명'),
        keyPoints: parseInputField(requestText, '핵심 포인트'),
        benefits: parseInputField(requestText, '혜택'),
        duration: parseInputField(requestText, '기간'),
        broadcastName: parseInputField(requestText, '방송명/기획전명'),
        celebName: parseInputField(requestText, '셀럽/모델'),
        target: parseInputField(requestText, '타겟'),
        mustInclude: parseInputField(requestText, '꼭 넣을 표현'),
        mustExclude: parseInputField(requestText, '제외할 표현'),
        hashtagRef: parseInputField(requestText, '해시태그 참고'),
      };

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload), // 폼 규격에 맞춘 결합 데이터 전송
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '엔진 API 응답 실패');
      }
      
      const data = await response.json();
      const rawText = data.result;

      // 3. 백엔드 특수 구분 기호 기준 정밀 분배 파싱
      const meta1 = rawText.split('===META1===')[1]?.split('===META2===')[0]?.trim() || '추출 실패';
      const meta2 = rawText.split('===META2===')[1]?.split('===GOOGLE_DEMANDGEN===')[0]?.trim() || '추출 실패';
      const demandgen = rawText.split('===GOOGLE_DEMANDGEN===')[1]?.split('===TIKTOK===')[0]?.trim() || '추출 실패';
      const tiktok = rawText.split('===TIKTOK===')[1]?.trim() || '추출 실패';

      // 기존 구글 PMAX, ACI 보드 호환 유지를 위한 대체 매핑
      const generatedResults: PlatformResult = { 
        meta1, 
        meta2, 
        demandgen, 
        pmax: demandgen, 
        aci: demandgen, 
        tiktok 
      };
      
      setResultText(generatedResults);

      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // 브랜드명과 상품명을 조합해 히스토리 타이틀 생성
      const displayTitle = (payload.brandName || payload.productName) 
        ? `${payload.brandName} ${payload.productName}`.trim()
        : `캠페인 안 ${historyList.length + 1}`;

      const newHistory: HistoryItem = {
        id: Date.now(),
        time: timeString,
        title: displayTitle,
        request: requestText,
        results: generatedResults
      };

      // 4. 리액트 상태 동기화 및 브라우저 localStorage 영구 보존 동시 실행
      const updated = [newHistory, ...historyList];
      setHistoryList(updated);
      localStorage.setItem('copywriter_history', JSON.stringify(updated));

    } catch (error: any) {
      alert(`엔진 파싱 오류: ${error.message}\n데이터 추출 포맷을 다시 확인해 주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 히스토리 전체 삭제 헬퍼 함수
  const handleClearHistory = () => {
    if (confirm("그동안 저장된 모든 카피 히스토리를 영구히 삭제하시겠습니까?")) {
      setHistoryList([]);
      localStorage.removeItem('copywriter_history');
    }
  };

  return (
    <div className="flex h-screen w-screen m-0 p-0 bg-gray-100 text-gray-950 overflow-hidden font-sans relative">
      
      {/* 메인 작업 영역 (좌측 8/12) */}
      <div className="w-8/12 h-full flex flex-col border-r border-gray-300 bg-white">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h1 className="text-xl font-extrabold text-gray-900">
            ✍️ 온스타일 멀티 매체 카피라이터 엔진
          </h1>
          <Link href="/dashboard" className="text-xs font-bold text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 bg-white">
            &larr; 대시보드 메인
          </Link>
        </div>

        {/* 텍스트 입력창 */}
        <div className="h-2/5 p-6 flex flex-col border-b border-gray-200 bg-white flex-shrink-0">
          <textarea 
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            disabled={isLoading}
            className="w-full flex-1 p-4 bg-gray-50 border border-gray-300 rounded-xl resize-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleGenerate}
            disabled={isLoading}
            className={`mt-4 w-full py-3.5 text-white font-bold rounded-xl shadow-sm transition ${isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isLoading ? 'CJ온스타일 가이드라인 검증 조합 중... ⏳' : '실시간 광고 매체별 세트 추출하기 🚀'}
          </button>
        </div>

        {/* 3단 레이아웃 완전체 보드 출력부 */}
        <div className="flex-1 p-6 flex flex-col bg-gray-50/30 min-h-0 overflow-hidden">
          <h2 className="text-sm font-black text-gray-500 mb-3 flex-shrink-0">✨ 실무 배치용 매체별 최종 피드셋</h2>
          
          <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Meta */}
            <div className="border border-blue-200 rounded-xl p-4 flex flex-col bg-white shadow-sm min-h-0">
              <div className="text-[11px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md mb-2 w-max">📱 Meta 시스템 (완성형)</div>
              <div className="flex-1 overflow-y-auto text-xs font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed pr-1 custom-scrollbar">
                {resultText && resultText.meta1 !== '추출 실패' ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="block text-[10px] text-indigo-600 font-bold mb-1">[1안: 혜택/직관형]</span>
                      {resultText.meta1}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="block text-[10px] text-indigo-600 font-bold mb-1">[2안: 감성/상황형 또는 셀럽형]</span>
                      {resultText.meta2}
                    </div>
                  </div>
                ) : "메타 최적화 카피 피드가 표시됩니다."}
              </div>
            </div>

            {/* Google 제품군 */}
            <div className="border border-amber-200 rounded-xl p-4 flex flex-col bg-white shadow-sm min-h-0">
              <div className="flex justify-between items-center mb-2 flex-shrink-0">
                <div className="text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-max">🔍 Google 엔진 통합</div>
                <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-md text-[9px] font-bold">
                  {(['demandgen', 'pmax', 'aci'] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveGoogleTab(tab)} className={`px-1.5 py-0.5 rounded-sm capitalize ${activeGoogleTab === tab ? 'bg-white shadow-xs text-gray-900' : 'text-gray-400'}`}>{tab}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto text-xs font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border pr-1 custom-scrollbar">
                {resultText && resultText.demandgen !== '추출 실패' ? resultText[activeGoogleTab] : "구글 매체 규격 세트가 표시됩니다."}
              </div>
            </div>

            {/* TikTok */}
            <div className="border border-red-200 rounded-xl p-4 flex flex-col bg-white shadow-sm min-h-0">
              <div className="text-[11px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md mb-2 w-max">🎵 TikTok 숏폼 카피 (100자 내외)</div>
              <div className="flex-1 overflow-y-auto text-xs font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border pr-1 custom-scrollbar">
                {resultText && resultText.tiktok !== '추출 실패' ? resultText.tiktok : "틱톡 숏폼 자막 카피가 표시됩니다."}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 히스토리 영역 */}
      <div className="w-4/12 h-full flex flex-col bg-gray-50 flex-shrink-0">
        <div className="p-5 border-b border-gray-300 bg-white shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-gray-900">📜 기획 카피 히스토리</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-black">{historyList.length} 건</span>
          </div>
          {historyList.length > 0 && (
            <button onClick={handleClearHistory} className="text-[10px] text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 bg-white font-bold transition">
              전체 비우기
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {historyList.map((item) => (
            <div key={item.id} onClick={() => { setResultText(item.results); setRequestText(item.request); }} className="p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-xl shadow-sm cursor-pointer transition">
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-xs font-black text-gray-900">{item.title}</span>
                <span className="text-[10px] font-bold text-gray-400">{item.time}</span>
              </div>
              <p className="text-[11px] text-gray-500 truncate border-t pt-1">{item.request}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}