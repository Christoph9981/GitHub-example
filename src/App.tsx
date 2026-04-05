/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, Twitter, Instagram, Youtube, Mail, Zap, Skull, CheckCircle2, Trophy, ArrowRight, RotateCcw, LogIn, User } from "lucide-react";
import { db, auth, googleProvider, signInWithPopup } from "./firebase";
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

const POLL_OPTIONS = [
  { id: "op", name: "One Piece", color: "from-red-500 to-orange-600" },
  { id: "db", name: "Dragon Ball", color: "from-orange-400 to-yellow-500" },
  { id: "ds", name: "Demon Slayer", color: "from-pink-500 to-purple-600" },
  { id: "jk", name: "Jujutsu Kaisen", color: "from-blue-600 to-indigo-700" },
  { id: "nar", name: "Naruto", color: "from-orange-600 to-red-700" },
];

const QUIZ_QUESTIONS = [
  {
    question: "¿Cuál es el nombre del protagonista de One Piece?",
    options: ["Zoro", "Luffy", "Sanji", "Ace"],
    correct: 1,
  },
  {
    question: "¿Cómo se llama la técnica principal de Goku?",
    options: ["Rasengan", "Getsuga Tenshou", "Kamehameha", "Chidori"],
    correct: 2,
  },
  {
    question: "¿Quién es el autor de Dragon Ball?",
    options: ["Eiichiro Oda", "Masashi Kishimoto", "Akira Toriyama", "Tite Kubo"],
    correct: 2,
  },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [pollResults, setPollResults] = useState<Record<string, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        checkUserVote(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = collection(db, "votes");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: Record<string, number> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const animeId = data.animeId as string;
        results[animeId] = (results[animeId] || 0) + 1;
      });
      setPollResults(results);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "votes");
    });
    return () => unsubscribe();
  }, []);

  const checkUserVote = async (userId: string) => {
    try {
      const q = query(collection(db, "votes"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setVoted(querySnapshot.docs[0].data().animeId as string);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "votes");
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleVote = async (id: string) => {
    if (!user) {
      handleLogin();
      return;
    }
    if (voted) return;

    try {
      const voteId = `${user.uid}_poll`;
      await setDoc(doc(db, "votes", voteId), {
        animeId: id,
        userId: user.uid,
        votedAt: serverTimestamp(),
      });
      setVoted(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `votes/${user.uid}_poll`);
    }
  };

  const handleQuizAnswer = async (index: number) => {
    const isCorrect = index === QUIZ_QUESTIONS[currentQuestion].correct;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(newScore);
    }

    if (currentQuestion + 1 < QUIZ_QUESTIONS.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizFinished(true);
      if (user) {
        try {
          const resultId = `${user.uid}_${Date.now()}`;
          await setDoc(doc(db, "quizResults", resultId), {
            score: newScore,
            total: QUIZ_QUESTIONS.length,
            userId: user.uid,
            completedAt: serverTimestamp(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `quizResults/${user.uid}_${Date.now()}`);
        }
      }
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
  };

  const totalVotes = Object.values(pollResults).reduce((a, b) => (a as number) + (b as number), 0) as number;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500 selection:text-black overflow-x-hidden relative">
      {/* Scanlines Effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />

      {/* Floating Kanji Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none select-none flex items-center justify-center overflow-hidden">
        <div className="text-[20rem] font-black rotate-12 leading-none">
          冒険 <br /> アニマックス
        </div>
      </div>

      {/* Header with Login */}
      <header className="relative z-20 flex justify-end p-6">
        {!loading && (
          user ? (
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-orange-500/50" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} className="text-orange-500" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
              <button onClick={() => auth.signOut()} className="text-xs text-slate-400 hover:text-white transition-colors">Salir</button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-full transition-all text-sm font-bold shadow-[0_0_15px_rgba(234,88,12,0.3)]"
            >
              <LogIn size={18} />
              Entrar
            </button>
          )
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center py-10 px-6 text-center max-w-6xl mx-auto">
        
        {/* Logo/Icon Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 animate-pulse" />
          <div className="relative p-6 border-2 border-orange-500/30 rounded-full bg-black/40 backdrop-blur-sm">
            <Compass size={64} className="text-orange-500 animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="absolute -inset-2 border border-orange-500/20 rounded-full animate-ping" />
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter mb-2 relative group">
            <span className="relative z-10 bg-gradient-to-b from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              ANIMAX
            </span>
            <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-50 group-hover:translate-x-1 transition-all duration-75 -z-10">ANIMAX</span>
            <span className="absolute inset-0 text-blue-500 opacity-0 group-hover:opacity-50 group-hover:-translate-x-1 transition-all duration-75 -z-10">ANIMAX</span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-orange-500" />
            <span className="text-orange-500 font-mono tracking-[0.3em] text-sm uppercase">
              Coming Back Soon • 2026
            </span>
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-orange-500" />
          </div>
        </motion.div>

        {/* Japanese Text / Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <p className="text-2xl md:text-3xl font-light text-slate-400 max-w-2xl leading-relaxed">
            La aventura se está <span className="text-white font-bold italic">recalibrando</span>. <br />
            <span className="text-orange-500/80 font-mono text-lg">再起動中... (Reiniciando...)</span>
          </p>
        </motion.div>

        {/* Grid for Interactive Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mt-12">
          
          {/* Poll Section */}
          <motion.section 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Skull size={80} />
            </div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Zap className="text-orange-500" size={24} />
              Votación de Importación
            </h2>
            <p className="text-slate-400 text-sm mb-6">¿Qué anime deberíamos traer primero a la tienda?</p>
            
            <div className="space-y-4">
              {POLL_OPTIONS.map((option) => {
                const votes = (pollResults[option.id] as number) || 0;
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(option.id)}
                    disabled={!!voted}
                    className={`w-full relative group transition-all duration-300 ${voted ? 'cursor-default' : 'hover:scale-[1.02]'}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-0 group-hover:opacity-10 rounded-lg transition-opacity`} />
                    <div className={`relative flex items-center justify-between p-4 border rounded-lg transition-all ${voted === option.id ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.name}</span>
                        {voted && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {votes} votos ({percentage.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                      {voted === option.id && <CheckCircle2 size={20} className="text-orange-500" />}
                    </div>
                    {voted && (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${option.color} rounded-full opacity-50`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {!user && (
              <p className="mt-4 text-center text-xs text-slate-500 font-mono">
                Inicia sesión para votar
              </p>
            )}
            {voted && (
              <p className="mt-4 text-center text-xs text-orange-500 font-mono animate-pulse">
                ¡Gracias por tu voto! Resultados en tiempo real.
              </p>
            )}
          </motion.section>

          {/* Quiz Section */}
          <motion.section 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-left flex flex-col"
          >
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Trophy className="text-yellow-500" size={24} />
              Desafío Otaku
            </h2>
            <p className="text-slate-400 text-sm mb-6">Demuestra que eres un verdadero fan.</p>

            <div className="flex-grow flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {!quizStarted ? (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <p className="text-slate-300 mb-8">¿Estás listo para el reto definitivo?</p>
                    <button 
                      onClick={() => setQuizStarted(true)}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-full transition-all flex items-center gap-2 mx-auto group"
                    >
                      Empezar Quiz
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ) : quizFinished ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="text-5xl font-black text-orange-500 mb-4">{score}/{QUIZ_QUESTIONS.length}</div>
                    <p className="text-xl mb-6">
                      {score === QUIZ_QUESTIONS.length ? "¡Eres un Maestro Otaku!" : "Nada mal, pero puedes mejorar."}
                    </p>
                    {!user && <p className="text-xs text-slate-500 mb-4 font-mono">Inicia sesión para guardar tu récord</p>}
                    <button 
                      onClick={resetQuiz}
                      className="text-slate-400 hover:text-white flex items-center gap-2 mx-auto transition-colors"
                    >
                      <RotateCcw size={16} />
                      Intentar de nuevo
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-xs font-mono text-orange-500 mb-2 uppercase tracking-widest">
                      Pregunta {currentQuestion + 1} de {QUIZ_QUESTIONS.length}
                    </div>
                    <h3 className="text-xl font-medium mb-6">{QUIZ_QUESTIONS[currentQuestion].question}</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(idx)}
                          className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="w-full max-w-md mt-20"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex bg-black rounded-lg overflow-hidden border border-white/10">
              <input 
                type="email" 
                placeholder="Tu email para el acceso anticipado..." 
                className="w-full bg-transparent px-4 py-4 outline-none text-sm placeholder:text-slate-600"
              />
              <button className="bg-orange-600 px-6 py-4 hover:bg-orange-500 transition-colors flex items-center justify-center">
                <Zap size={20} className="fill-current" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">
            Únete a la tripulación. No te pierdas el lanzamiento.
          </p>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex gap-8"
        >
          <SocialIcon icon={<Twitter size={24} />} href="#" />
          <SocialIcon icon={<Instagram size={24} />} href="#" />
          <SocialIcon icon={<Youtube size={24} />} href="#" />
          <SocialIcon icon={<Skull size={24} />} href="#" />
        </motion.div>
      </main>

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
      <div className="fixed bottom-4 right-6 text-[10px] font-mono text-slate-700 uppercase tracking-widest vertical-text select-none">
        System Status: Online // Protocol: Adventure
      </div>
    </div>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a 
      href={href} 
      className="text-slate-500 hover:text-orange-500 transition-all hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]"
    >
      {icon}
    </a>
  );
}
