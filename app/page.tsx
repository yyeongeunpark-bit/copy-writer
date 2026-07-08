'use client';
import { useState } from 'react';

export default function Home() {
  const [productInfo, setProductInfo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!productInfo.trim()) {
      alert('제품 및 프로모션 정보를 입력해주세요!');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productInfo }),
      });
      const data = await res.json();
      setResult(data.result || data.error);
    } catch (err) {
      setResult('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>🚀 올인원 광고 카피 생성기</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>한 번만 입력하면 메타, 구글, 틱톡 맞춤형 카피가 동시에 완성됩니다.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>📝 제품 / 프로모션 정보 입력</label>
        <textarea 
          rows={6} 
          style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', lineHeight: '1.5' }}
          placeholder="예시)&#13;풀무원 음식물처리기 에어드라이&#13;풀무원음식물처리기 김호영의투머치쇼 파격특가 #김호영의투머치쇼 #김호영 #풀무원 #풀무원음식물처리기"
          value={productInfo}
          onChange={(e) => setProductInfo(e.target.value)}
        />
      </div>

      <button 
        onClick={handleGenerate} 
        disabled={loading} 
        style={{ 
          width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold',
          backgroundColor: loading ? '#ccc' : '#111', color: 'white', 
          border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? 'AI가 매체별 광고 카피를 기획하는 중...' : '모든 매체 광고 문안 한 번에 만들기 ✨'}
      </button>

      {result && (
        <div style={{ marginTop: '30px', padding: '25px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
          <h2 style={{ marginTop: 0, borderBottom: '2px solid #111', paddingBottom: '10px', fontSize: '20px' }}>🎁 매체별 생성 결과</h2>
          <div style={{ fontSize: '16px', color: '#333' }}>{result}</div>
        </div>
      )}
    </div>
  );
}