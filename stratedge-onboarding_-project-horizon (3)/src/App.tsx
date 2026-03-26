import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  ChevronRight, 
  Star, 
  Zap, 
  CheckCircle2,
  Award,
  TrendingUp,
  Brain,
  Play,
  ClipboardList,
  Layout,
  ArrowRight,
  Users,
  Briefcase,
  UserCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { CHAPTER_1_QUIZ, TEAM, COMPANY_NAME, PROJECT_NAME, CHAPTER_1_IMAGE, VIDEO_THUMBNAIL } from './data/content';
import { 
  GameState, 
  Verdict, 
  PerformanceReview,
  QuizAnswer
} from './types';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentStep: 'welcome',
    currentQuestionIndex: 0,
    answers: [],
    totalXP: 0,
    level: 1,
    badges: [],
    review: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoInput, setVideoInput] = useState("");
  const [quizInput, setQuizInput] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const currentQuestion = CHAPTER_1_QUIZ[gameState.currentQuestionIndex];

  const levelName = useMemo(() => {
    if (gameState.totalXP <= 40) return "New Joiner";
    if (gameState.totalXP <= 80) return "Contributor";
    return "Consultant";
  }, [gameState.totalXP]);

  const handleNextStep = () => {
    const steps: GameState['currentStep'][] = ['welcome', 'team_intro', 'chapter_intro', 'video', 'quiz', 'review', 'summary'];
    const currentIndex = steps.indexOf(gameState.currentStep);
    if (currentIndex < steps.length - 1) {
      setGameState(prev => ({ ...prev, currentStep: steps[currentIndex + 1] }));
    }
  };

  const handleChoice = (choiceId: string, textAnswer?: string) => {
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      choiceId,
      textAnswer
    };

    const newAnswers = [...gameState.answers, newAnswer];
    setQuizFeedback("✔ Response recorded");
    
    setTimeout(() => {
      setQuizFeedback(null);
      setQuizInput("");
      if (gameState.currentQuestionIndex < CHAPTER_1_QUIZ.length - 1) {
        setGameState(prev => ({
          ...prev,
          answers: newAnswers,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      } else {
        generateReview(newAnswers);
      }
    }, 800);
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizInput.trim()) return;

    const input = quizInput.trim().toUpperCase();
    const choice = currentQuestion.choices.find(c => c.id === input);
    
    if (choice) {
      handleChoice(choice.id);
    } else {
      handleChoice("CUSTOM", quizInput);
    }
  };

  const generateReview = async (finalAnswers: QuizAnswer[]) => {
    setIsAnalyzing(true);
    setGameState(prev => ({ ...prev, currentStep: 'review', answers: finalAnswers }));

    try {
      const model = "gemini-3-flash-preview";
      const prompt = `
        You are an expert consulting evaluator at ${COMPANY_NAME}. 
        Evaluate a new hire's performance in the ${PROJECT_NAME} onboarding quiz for "Autonomy & Ownership".
        
        Team Context:
        - Marcus (Manager): Strict, results-oriented.
        - Elena (Teammate): Helpful but overwhelmed.
        - Mr. Sterling (Client): Demanding, vague.

        Quiz Data:
        ${finalAnswers.map((ans, i) => {
          const q = CHAPTER_1_QUIZ[i];
          const choice = q.choices.find(c => c.id === ans.choiceId);
          return `Q${q.id}: ${q.scenario}\nUser Answer: ${ans.choiceId === "CUSTOM" ? ans.textAnswer : choice?.text}`;
        }).join('\n\n')}
        
        Evaluate based on:
        1. Overall Score (0-10)
        2. Breakdown (0-10): Initiative, Ownership, Decision Making
        3. Verdict: "Excellent", "Good", "Needs Improvement", or "Poor"
        4. Strengths (2 bullet points) - Reference specific scenarios and team interactions.
        5. Improvements (2 bullet points) - Reference specific scenarios and team interactions.
        6. XP Awarded (0-100)
        
        Return ONLY a JSON object with this structure:
        {
          "overallScore": number,
          "breakdown": { "initiative": number, "ownership": number, "decisionMaking": number },
          "verdict": "Excellent" | "Good" | "Needs Improvement" | "Poor",
          "strengths": ["string", "string"],
          "improvements": ["string", "string"],
          "xpAwarded": number,
          "badgeUnlocked": "Ownership Mindset" (only if overallScore >= 8)
        }
      `;

      const result = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const review: PerformanceReview = JSON.parse(result.text || "{}");
      
      setGameState(prev => ({
        ...prev,
        review,
        totalXP: review.xpAwarded,
        level: review.xpAwarded > 80 ? 3 : (review.xpAwarded > 40 ? 2 : 1),
        badges: review.badgeUnlocked ? [review.badgeUnlocked] : []
      }));
    } catch (error) {
      console.error("Error generating review:", error);
      const fallback: PerformanceReview = {
        overallScore: 7,
        breakdown: { initiative: 7, ownership: 7, decisionMaking: 7 },
        verdict: Verdict.Good,
        strengths: ["Proactive approach to Marcus's tasks", "Good handling of Mr. Sterling's requests"],
        improvements: ["Could be more decisive in data discrepancies", "Focus on team collaboration with Elena"],
        xpAwarded: 70
      };
      setGameState(prev => ({ ...prev, review: fallback, totalXP: 70 }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderWelcome = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center space-y-8 py-12"
    >
      <div className="inline-block p-4 bg-slate-900 rounded-3xl text-white mb-4">
        <Layout size={48} />
      </div>
      <h1 className="text-5xl font-bold tracking-tight text-slate-900">
        Onboarding Platform
      </h1>
      <p className="text-xl text-slate-600 leading-relaxed">
        Welcome to your professional development journey. This platform will guide you through core competencies required for success at the firm.
      </p>
      <button 
        onClick={handleNextStep}
        className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto group"
      >
        Start Learning <ChevronRight className="group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );

  const renderTeamIntro = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto space-y-8 py-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-slate-900">Team & Project Introduction</h2>
        <p className="text-slate-600">You’ve joined as a Consultant at <span className="font-bold text-slate-900">{COMPANY_NAME}</span>. You’re assigned to <span className="font-bold text-slate-900">{PROJECT_NAME}</span>, a high-stakes digital transformation for a retail giant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TEAM.map((member) => (
          <div key={member.name} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col items-center text-center">
            {member.imageUrl ? (
              <img 
                src={member.imageUrl} 
                alt={member.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-900">
                <UserCircle size={48} />
              </div>
            )}
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-lg">{member.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{member.description}</p>
          </div>
        ))}
      </div>

      <button 
        onClick={handleNextStep}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        Continue to Chapter 1 <ArrowRight size={20} />
      </button>
    </motion.div>
  );

  const renderChapterIntro = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto space-y-8 py-12"
    >
      <div className="space-y-2 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Chapter 1</span>
        <h2 className="text-4xl font-bold text-slate-900">Autonomy & Ownership</h2>
      </div>
      
      <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white">
        <img 
          src={CHAPTER_1_IMAGE} 
          alt="Autonomy & Ownership" 
          className="w-full h-48 object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="p-8">
          <p className="text-lg text-slate-700 leading-relaxed">
            Autonomy and Ownership means taking full responsibility for your work without waiting for constant direction. In consulting, this means identifying problems proactively, proposing solutions to Marcus, and acting with the same care as if you owned the firm yourself.
          </p>
        </div>
      </div>

      <button 
        onClick={handleNextStep}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        Continue to Video <ArrowRight size={20} />
      </button>
    </motion.div>
  );

  const renderVideo = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto space-y-8 py-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Play size={24} className="text-slate-900" /> 🎬 Training Video: Autonomy & Ownership
        </h2>
      </div>

      <div className="relative aspect-video bg-slate-100 rounded-3xl border-4 border-slate-200 overflow-hidden group cursor-pointer">
        <img 
          src={VIDEO_THUMBNAIL} 
          alt="Video Thumbnail" 
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12 text-center space-y-4 bg-black/20">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl group-hover:scale-110 transition-transform">
            <Play size={40} fill="currentColor" />
          </div>
          <p className="text-sm font-bold tracking-wide uppercase drop-shadow-md">
            Taking Initiative & Ownership
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-center text-slate-500 text-sm">Type 'done' once you’ve completed the video.</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={videoInput}
            onChange={(e) => setVideoInput(e.target.value)}
            placeholder="Type 'done' here..."
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button 
            disabled={videoInput.toLowerCase() !== 'done'}
            onClick={handleNextStep}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderProgressTracker = () => {
    const step = gameState.currentQuestionIndex + 1;
    const steps = [1, 2, 3, 4, 5];
    
    const bar = steps.map((s, i) => {
      let mark = s.toString();
      if (s < step) mark = "✔";
      if (s === step) mark = "●";
      
      return (
        <React.Fragment key={s}>
          <span className={s === step ? "text-slate-900 font-bold" : "text-slate-400"}>{mark}</span>
          {i < steps.length - 1 && <span className="mx-4 text-slate-200">───</span>}
        </React.Fragment>
      );
    });

    return (
      <div className="text-center space-y-2 mb-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {step} of 5</p>
        <div className="flex items-center justify-center text-sm">
          {bar}
        </div>
      </div>
    );
  };

  const renderQuiz = () => (
    <motion.div 
      key={currentQuestion.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-3xl mx-auto space-y-4 py-4"
    >
      {renderProgressTracker()}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {currentQuestion.imageUrl && (
          <img 
            src={currentQuestion.imageUrl} 
            alt="Scenario" 
            className="w-full h-32 object-cover border-b border-slate-50"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="p-6 space-y-4">
          <p className="text-lg text-slate-800 font-medium leading-snug">
            {currentQuestion.scenario}
          </p>
          <p className="text-sm font-bold text-slate-900 border-t border-slate-50 pt-4 uppercase tracking-widest">
            What do you do?
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {currentQuestion.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice.id)}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-left hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center gap-4 group"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors text-sm">
              {choice.id}
            </span>
            <span className="text-base text-slate-800 font-medium">{choice.text}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleQuizSubmit} className="space-y-4 pt-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Or type your answer below</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={quizInput}
            onChange={(e) => setQuizInput(e.target.value)}
            placeholder="Type A, B, C or your custom response..."
            className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button 
            type="submit"
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Submit
          </button>
        </div>
      </form>

      <AnimatePresence>
        {quizFeedback && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center font-bold text-slate-900"
          >
            {quizFeedback}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderReview = () => {
    if (isAnalyzing || !gameState.review) {
      return (
        <div className="max-w-2xl mx-auto py-24 text-center space-y-4">
          <Brain className="mx-auto text-slate-900 animate-bounce" size={48} />
          <h2 className="text-2xl font-bold text-slate-900">Generating Performance Review...</h2>
          <p className="text-slate-500">Our AI is evaluating your responses based on initiative, ownership, and decision quality within {PROJECT_NAME}.</p>
        </div>
      );
    }

    const review = gameState.review;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8 py-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">Performance Review</h2>
          <div className="px-4 py-2 bg-slate-900 text-white rounded-full font-bold text-xs tracking-widest uppercase">
            Verdict: {review.verdict}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Overall Score</h3>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-slate-900">{review.overallScore}</span>
                <span className="text-slate-400 font-medium mb-2">/ 10</span>
              </div>
              <div className="space-y-4 pt-4">
                {Object.entries(review.breakdown).map(([skill, score]) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                      <span>{skill}</span>
                      <span>{score}/10</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900" style={{ width: `${Number(score) * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
              <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={18} /> Key Strengths
              </h4>
              <ul className="space-y-2">
                {review.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                    <span className="text-emerald-400">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} /> Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {review.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-900 flex items-start gap-2">
                    <span className="text-slate-400">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button 
          onClick={handleNextStep}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          View Final Summary <ChevronRight size={20} />
        </button>
      </motion.div>
    );
  };

  const renderSummary = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center space-y-12 py-12"
    >
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-slate-900">Chapter 1 Complete ✅</h2>
        <p className="text-slate-500">You have successfully mastered the basics of Autonomy & Ownership for <span className="font-bold text-slate-900">{PROJECT_NAME}</span>.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Zap className="mx-auto text-yellow-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total XP</p>
          <p className="text-2xl font-black text-slate-900">{gameState.totalXP}</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Star className="mx-auto text-blue-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Level</p>
          <p className="text-2xl font-black text-slate-900">{gameState.level}</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Award className="mx-auto text-purple-400 mb-2" size={24} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Badges</p>
          <p className="text-2xl font-black text-slate-900">{gameState.badges.length}</p>
        </div>
      </div>

      {gameState.badges.length > 0 && (
        <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-yellow-400">
              <Star fill="currentColor" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Badge Unlocked</p>
              <p className="text-lg font-bold">{gameState.badges[0]}</p>
            </div>
          </div>
          <CheckCircle2 className="text-emerald-400" />
        </div>
      )}

      <div className="space-y-4 pt-8">
        <p className="text-xl font-bold text-slate-900">Ready for the next chapter?</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all"
        >
          Continue Journey
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
              <ClipboardList size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Learning Hub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">StratEdge Onboarding</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</p>
                <p className="text-xs font-bold text-slate-900">{levelName}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center font-bold text-sm">
                {gameState.level}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP</p>
              <span className="text-sm font-bold text-slate-900">{gameState.totalXP}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        <AnimatePresence mode="wait">
          {gameState.currentStep === 'welcome' && renderWelcome()}
          {gameState.currentStep === 'team_intro' && renderTeamIntro()}
          {gameState.currentStep === 'chapter_intro' && renderChapterIntro()}
          {gameState.currentStep === 'video' && renderVideo()}
          {gameState.currentStep === 'quiz' && renderQuiz()}
          {gameState.currentStep === 'review' && renderReview()}
          {gameState.currentStep === 'summary' && renderSummary()}
        </AnimatePresence>
      </main>
    </div>
  );
}
