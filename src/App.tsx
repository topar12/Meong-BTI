import { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { QuizScreen } from './components/Quiz';
import { LoadingScreen } from './components/Loading';
import { ResultScreen } from './components/Result';
import { calculateResult } from './data/questions';
import { logEvent } from './firebase';

// Logic constants
type Step = 'intro' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'loading' | 'result';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalResult, setFinalResult] = useState<string>('');

  const handleAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    const nextStepMap: Record<string, string> = {
      'q1': 'q2', 'q2': 'q3', 'q3': 'q4',
      'q4': 'q5', 'q5': 'q6', 'q6': 'q7'
    };

    if (questionId === 'q7') {
      setFinalResult(calculateResult(newAnswers));
      setCurrentStep('loading');
    } else {
      setCurrentStep(nextStepMap[questionId] as Step);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep('intro');
  };

  // Variants for fast screen transitions
  const pageVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }
  };

  const getProgress = () => {
    switch(currentStep) {
      case 'q1': return 14;
      case 'q2': return 28;
      case 'q3': return 42;
      case 'q4': return 57;
      case 'q5': return 71;
      case 'q6': return 85;
      case 'q7': return 100;
      default: return 0;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-100 text-[var(--color-charcoal)] flex flex-col items-center">
      <div className="w-full max-w-[400px] min-h-[100dvh] bg-[var(--color-offwhite)] shadow-2xl relative flex flex-col overflow-hidden sm:min-h-screen">
        
        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div key="intro" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col p-8">
              <div className="flex-1 flex flex-col justify-center">
                <span className="text-sm tracking-widest uppercase mb-4 text-[var(--color-sage)] font-bold">PETFOOD JUO</span>
                <h1 className="leading-tight mb-6 flex flex-col gap-1">
                  <span className="text-xl font-extrabold text-[#E6AD84] tracking-wide">우리 아이의 진짜 속마음</span>
                  <span className="text-4xl sm:text-5xl font-black text-[var(--color-charcoal)] tracking-tight">멍-BTI 행동학 테스트</span>
                </h1>
                <p className="text-sm text-black/70 leading-relaxed max-w-xs break-keep">
                  보이지 않는 우리 아이의 진짜 성향을 알아보고, 그에 딱 맞는 100% 프리미엄 수제 간식을 추천받아 보세요!
                </p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-black/5 text-black/60 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">🐾 100% 휴먼그레이드 지원</span>
                  <span className="bg-black/5 text-black/60 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">💡 기질 분석 데이터 기반</span>
                </div>

                <p className="text-[10px] text-black/40 font-bold tracking-widest uppercase mt-6 mb-2">
                  Based on C-BARQ & MCPQ Framework
                </p>

                {/* MBTI Explanation Box (Professional) */}
                <div className="mt-2 bg-white p-5 rounded-2xl text-sm shadow-sm border border-black/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#A8BBA2]"></div>
                  <p className="font-extrabold flex items-center gap-1.5 mb-2 text-[var(--color-charcoal)]">
                    <span className="text-lg">🔬</span> 멍-BTI 기질 분석 시스템
                  </p>
                  <p className="text-[11px] text-black/60 leading-relaxed mb-4 break-keep font-medium">
                    사람의 MBTI처럼 반려견의 성격도 체계적으로 나눌 수 있습니다. 단순 재미가 아닌, 실제 수의학·행동학에서 사용하는 기질 평가 지표를 바탕으로 우리 아이의 핵심 본능 3가지를 분석합니다.
                  </p>
                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-black/5 pb-3">
                    <ul className="space-y-3 text-black/80 font-bold text-xs">
                      <li className="flex items-center gap-3">
                        <span className="w-9 text-center bg-white border border-black/10 rounded shadow-sm py-1 text-[10px]">E/C</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-black/40 tracking-wider">ENERGY</span>
                          <span className="text-[11px]">활동 에너지 (활동적 ↔ 차분함)</span>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-9 text-center bg-white border border-black/10 rounded shadow-sm py-1 text-[10px]">G/P</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-black/40 tracking-wider">GASTRONOMY</span>
                          <span className="text-[11px]">식탐 수준 (폭풍흡입 ↔ 까탈입맛)</span>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-9 text-center bg-white border border-black/10 rounded shadow-sm py-1 text-[10px]">I/A</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-black/40 tracking-wider">INDEPENDENCE</span>
                          <span className="text-[11px]">독립성 (독립적 ↔ 불안/껌딱지)</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="pb-8">
                <button 
                  onClick={() => { logEvent('quiz_start'); setCurrentStep('q1'); }}
                  className="w-full py-5 px-6 bg-[var(--color-charcoal)] text-[var(--color-offwhite)] rounded-none text-lg font-bold flex justify-between items-center transition-transform active:scale-95"
                >
                  <span>우리 아이 진짜 성향 알아보기</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </motion.div>
          )}

          {['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'].includes(currentStep) && (
            <QuizScreen 
              key={currentStep} 
              currentQ={currentStep} 
              onAnswer={handleAnswer} 
              progress={getProgress()}
              onRestart={handleRestart}
            />
          )}

          {currentStep === 'loading' && (
            <LoadingScreen 
              key="loading" 
              onComplete={() => setCurrentStep('result')} 
            />
          )}

          {currentStep === 'result' && (
            <ResultScreen 
              key="result" 
              resultId={finalResult}
              onRestart={handleRestart}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
