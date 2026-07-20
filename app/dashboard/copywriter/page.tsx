'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  History, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  Layers, 
  ChevronRight
} from 'lucide-react';

interface CopyResults {
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
  results: CopyResults;
}

export default function CopywriterPage() {
  const [productInfo, setProductInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CopyResults | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // 1. 페이지 접속 시 구글 시트에서 공유 히스토리 불러오기
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('히스토리 불러오기 실패:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 결과 파싱 함수
  const parseGeneratedText = (text: string): CopyResults => {
    const meta1Match = text.match(/===META1===([\s\S]*?)(?====META2===|===GOOGLE_DEMANDGEN===|===TIKTOK===|$)/);
    const meta2Match = text.match(/===META2===([\s\S]*?)(?====GOOGLE_DEMANDGEN===|===TIKTOK===|$)/);
    const googleMatch = text.match(/===GOOGLE_DEMANDGEN===([\s\S]*?)(?====TIKTOK===|$)/);
    const tiktokMatch = text.match(/===TIKTOK===([\s\S]*?)$/);

    const meta1 = meta1Match ? meta1Match[1].trim() : '';
    const meta2 = meta2Match ? meta2Match[1].trim() : '';
    const googleText = googleMatch ? googleMatch[1].trim() : '';
    const tiktok = tiktokMatch ? tiktokMatch[1].trim() : '';

    return {
      meta1,
      meta2,
      demandgen: googleText,
      pmax: googleText,
      aci: googleText,
      tiktok,
    };
  };

  // 카피 생성 및 구글 시트 자동 저장
  const handleGenerate = async () => {
    if (!productInfo.trim()) {
      alert('기획 정보를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      // 1) Gemini API 호출
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productInfo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '생성 실패');

      const parsedResults = parseGeneratedText(data.result);
      setResults(parsedResults);

      // 2) 구글 시트에 저장 API 호출
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: productInfo,
          results: parsedResults,
        }),
      });

      // 3) 최신 시트 데이터로 히스토리 리스트 갱신
      fetchHistory();

    } catch (err: any) {
      alert(`오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 히스토리 항목 클릭 시 복원
  const handleSelectHistory = (item: HistoryItem) => {
    setProductInfo(item.request);
    setResults(item.results);
  };

  // 클립보드 복사
  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="flex h-screen bg-[#0B0F17] text-gray-100 font-sans overflow-hidden">
      {/* 1. 메인 작업 영역 (좌측) */}
      <div className="flex-1 flex flex-col h-full border-r border-gray-800/60 overflow-y-auto custom-scrollbar">
        {/* 헤더 */}
        <header className="px-8 py-6 border-b border-gray-800/60 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl text-pink-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                CJ온스타일 AI 카피라이터
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">기획안 기반 실시간 매체별 광고 세트 생성기</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl w-full mx-auto space-y-8">
          {/* 입력 폼 */}
          <div className="bg-gray-900/50 border border-gray-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative group focus-within:border-pink-500/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-pink-400" />
                기획 정보 및 상품 정보 입력
              </label>
              <span className="text-xs text-gray-500">행사명, 브랜드, 특가, 단독혜택 등 자유 입력</span>
            </div>
            
            <textarea
              value={productInfo}
              onChange={(e) => setProductInfo(e.target.value)}
              placeholder="행사명, 브랜드, 상품명, 주요 혜택 등을 자유롭게 입력하세요."
              rows={6}
              className="w-full bg-[#0B0F17]/70 border border-gray-800 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-pink-500/50 resize-none transition"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>구글 시트에 카피 연동 및 생성 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>실시간 광고 매체별 세트 추출하기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 결과 영역 */}
          {results && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
                <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  생성된 매체별 광고 카피
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  title="💖 Meta (1안)" 
                  content={results.meta1} 
                  badge="페이스북/인스타그램"
                  sectionKey="meta1"
                  copiedSection={copiedSection}
                  onCopy={handleCopy}
                />

                <Card 
                  title="💖 Meta (2안)" 
                  content={results.meta2} 
                  badge="변주 버전"
                  sectionKey="meta2"
                  copiedSection={copiedSection}
                  onCopy={handleCopy}
                />

                <Card 
                  title="🔍 Google (Demand Gen)" 
                  content={results.demandgen} 
                  badge="유튜브/디스커버"
                  sectionKey="demandgen"
                  copiedSection={copiedSection}
                  onCopy={handleCopy}
                />

                <Card 
                  title="🎵 TikTok" 
                  content={results.tiktok} 
                  badge="숏폼 자막/문구"
                  sectionKey="tiktok"
                  copiedSection={copiedSection}
                  onCopy={handleCopy}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. 구글 시트 연동 공유 히스토리 (우측 사이드바) */}
      <div className="w-80 bg-[#0E131F] h-full flex flex-col border-l border-gray-800/60">
        <div className="p-5 border-b border-gray-800/60 flex items-center justify-between bg-[#0E131F]/90 backdrop-blur-md">
          <div className="flex items-center gap-2 text-gray-200 font-semibold text-sm">
            <History className="w-4 h-4 text-pink-400" />
            <span>공유 히스토리 (구글 시트)</span>
          </div>
          <button 
            onClick={fetchHistory}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800/50 transition"
            title="새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {historyLoading ? (
            <div className="text-center py-10 text-xs text-gray-500 flex flex-col items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
              <span>구글 시트 데이터 불러오는 중...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-500">
              저장된 공유 히스토리가 없습니다.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectHistory(item)}
                className="group p-3.5 rounded-xl bg-gray-900/40 hover:bg-gray-800/50 border border-gray-800/60 hover:border-pink-500/30 transition-all duration-200 cursor-pointer relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-mono">{item.time}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-xs font-medium text-gray-300 group-hover:text-white line-clamp-2 leading-relaxed">
                  {item.title}
                </h4>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 결과 카드 서브 컴포넌트
function Card({ 
  title, 
  content, 
  badge, 
  sectionKey, 
  copiedSection, 
  onCopy 
}: { 
  title: string; 
  content: string; 
  badge: string; 
  sectionKey: string; 
  copiedSection: string | null; 
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700/80 transition flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-200">{title}</h3>
            <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700/50">
              {badge}
            </span>
          </div>
          <button
            onClick={() => onCopy(content, sectionKey)}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-800/40 hover:bg-gray-800 border border-gray-700/50 rounded-lg transition text-xs flex items-center gap-1"
            title="복사하기"
          >
            {copiedSection === sectionKey ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] text-green-400">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px]">복사</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-[#0B0F17]/60 border border-gray-800/50 rounded-xl p-4 text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-wrap min-h-[140px]">
          {content || '생성된 내용이 없습니다.'}
        </div>
      </div>
    </div>
  );
}