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
    request: "KBO 올스타전 기념\n6/29~상시 99딜(오전 10시) -> 매일 10시 CJ단독 한정수량 9,900원딜\n전 브랜드 통합 최대할인율 50% \n-> 올스타전도 나만의 스타일로 응원즁\n올스타전 기념! 기간한정 9,900원딜 오픈",
    results: {
      meta1: "올스타전도 나만의 스타일로 응원 중! ⚾✨\nKBO 올스타전 기념, 오직 CJ온스타일에서만 만나는 역대급 기간 한정 9,900원딜이 오픈했습니다🖤\n\n✔ 매일 오전 10시, CJ단독 한정수량 9,900원 선착순 오픈\n✔ 전 브랜드 통합 최대 50% 압도적인 할인율\n✔ 올스타전을 더 완벽하게 즐기는 나만의 응원 스타일링\n\n💎 CJ온스타일에서 지금 한정 수량 특가를 만나보세요\n#KBO올스타전 #올스타전 #99딜 #한정수량 #CJ온스타일 #단독특가",
      meta2: "야구팬 주목! 매일 오전 10시가 기다려지는 이유 ⚾✨\nKBO 올스타전 기념 역대급 혜택, 전 브랜드 통합 최대 50% 할인에 한정수량 9,900원 딜까지 완벽 구성🖤\n\n✔ 올스타전 기념 기간한정 9,900원 특별 찬스\n✔ 매일 아침 10시 정각, 선착순 한정 수량 오픈 되니 스피드가 생명",
      demandgen: "광고 제목 5개\n1. KBO 올스타전 9,900원딜\n2. 매일 10시 CJ단독 한정 특가\n3. 전 브랜드 통합 최대 50% 할인\n4. 올스타전 기념 기간한정 99딜\n5. 나만의 스타일로 올스타전 응원\n\n긴 광고 제목 5개\n1. KBO 올스타전 기념 매일 오전 10시 CJ단독 한정수량 9,900원딜 오픈\n2. 전 브랜드 통합 최대 할인율 50% 올스타전 기념 기간한정 특가 찬스\n3. 올스타전도 나만의 스타일로 응원 중 온스타일 단독 9,900원 선착순 딜\n4. 매일 아침 10시 오픈되는 KBO 올스타전 기념 한정수량 99딜 기획전\n5. 기간 한정 역대급 혜택 전 브랜드 통합 최대 50% 세일 바로가기\n\n설명 5개\n1. 매일 오전 10시, CJ온스타일에서만 만나는 한정수량 9,900원 단독 특가가 진행됩니다.\n2. 전 브랜드 통합 최대 50% 할인율로 올스타전을 나만의 스타일로 완벽하게 준비하세요.\n3. 올스타전 기념 기간한정 9,900원 딜이 오픈되었으니 매일 아침 선착순 기회를 놓치지 마세요.\n4. KBO 올스타전의 열기를 더해줄 역대급 단독 구성과 특별 혜택을 지금 확인해보세요.\n5. 나만의 스타일로 응원하는 야구팬들을 위한 온스타일만의 특별 한정 수량 패키지입니다.",
      pmax: "구글 PMAX 규격 필드입니다.",
      aci: "구글 ACI 규격 필드입니다.",
      tiktok: "올스타전 응원도 나만의 스타일로! 매일 오전 10시 CJ온스타일 단독 한정수량 9,900원딜 오픈! 전 브랜드 통합 최대 50% 할인까지 다 주니까 야구팬이라면 지금 프로필 링크 누르고 선착순 99딜 탑승하세요!"
    }
  }
];

export default function CopywriterPage() {
  const [requestText, setRequestText] = useState('');
  const [resultText, setResultText] = useState<PlatformResult | null>(null);

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

  const handleGenerate = async () => {
    if (!requestText.trim()) return alert('광고 기획 내용을 입력해주세요!');
    setIsLoading(true);

    try {
      const payload = { brandName: requestText };

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '엔진 API 응답 실패');
      }
      
      const data = await response.json();
      const rawText = data.result;

      const meta1 = rawText.split('===META1===')[1]?.split('===META2===')[0]?.trim() || '추출 실패';
      const meta2 = rawText.split('===META2===')[1]?.split('===GOOGLE_DEMANDGEN===')[0]?.trim() || '추출 실패';
      const demandgen = rawText.split('===GOOGLE_DEMANDGEN===')[1]?.split('===TIKTOK===')[0]?.trim() || '추출 실패';
      const tiktok = rawText.split('===TIKTOK===')[1]?.trim() || '추출 실패';

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
      
      const firstLine = requestText.split('\n')[0] || '';
      const displayTitle = firstLine.length > 15 ? firstLine.slice(0, 15) + '...' : firstLine || `캠페인 안 ${historyList.length + 1}`;

      const newHistory: HistoryItem = {
        id: Date.now(),
        time: timeString,
        title: displayTitle,
        request: requestText,
        results: generatedResults
      };

      const updated = [newHistory, ...historyList];
      setHistoryList(updated);
      localStorage.setItem('copywriter_history', JSON.stringify(updated));

    } catch (error: any) {
      alert(`엔진 파싱 오류: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm("그동안 저장된 모든 카피 히스토리를 영구히 삭제하시겠습니까?")) {
      setHistoryList([]);
      localStorage.removeItem('copywriter_history');
    }
  };

  return (
    <div className="flex h-screen w-screen m-0 p-0 bg-gray-100 text-gray-950 overflow-hidden font-sans relative">
      <div className="w-8/12 h-full flex flex-col border-r border-gray-300 bg-white">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <h1 className="text-xl font-extrabold text-gray-900">✍️ 온스타일 멀티 매체 카피라이터 엔진</h1>
          <Link href="/dashboard" className="text-xs font-bold text-gray-500 border border-gray-300 rounded-lg px-3 py-1.5 bg-white">&larr; 대시보드 메인</Link>
        </div>

        <div className="h-2/5 p-6 flex flex-col border-b border-gray-200 bg-white flex-shrink-0">
          <textarea 
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            disabled={isLoading}
            placeholder="광고 기획 내용을 자유롭게 복사+붙여넣기 하세요."
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

        <div className="flex-1 p-6 flex flex-col bg-gray-50/30 min-h-0 overflow-hidden">
          <h2 className="text-sm font-black text-gray-500 mb-3 flex-shrink-0">✨ 실무 배치용 매체별 최종 피드셋</h2>
          <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
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

            <div className="border border-red-200 rounded-xl p-4 flex flex-col bg-white shadow-sm min-h-0">
              <div className="text-[11px] font-black text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md mb-2 w-max">🎵 TikTok 숏폼 카피 (100자 내외)</div>
              <div className="flex-1 overflow-y-auto text-xs font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-3 rounded-lg border pr-1 custom-scrollbar">
                {resultText && resultText.tiktok !== '추출 실패' ? resultText.tiktok : "틱톡 숏폼 자막 카피가 표시됩니다."}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-4/12 h-full flex flex-col bg-gray-50 flex-shrink-0">
        <div className="p-5 border-b border-gray-300 bg-white shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-gray-900">📜 기획 카피 히스토리</h2>
            <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-black">{historyList.length} 건</span>
          </div>
          {historyList.length > 0 && (
            <button onClick={handleClearHistory} className="text-[10px] text-red-500 hover:text-red-700 border border-red-200 rounded px-2 py-1 bg-white font-bold transition">전체 비우기</button>
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
