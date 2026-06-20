import { useState, useEffect } from 'react';
import axios from 'axios';

const DailyHub = () => {
  const [quote, setQuote] = useState<any>(null);
  const [deal, setDeal] = useState<any>(null);
  const [tip, setTip] = useState<any>(null);
  const [story, setStory] = useState<any>(null);
  const [tech, setTech] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [timer, setTimer] = useState(300);
  const [timerActive, setTimerActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [expertArticles, setExpertArticles] = useState<any[]>([]);
  const [newExpertArticle, setNewExpertArticle] = useState({ title: '', content: '', author: '' });

  useEffect(() => {
    fetchDailyContent();
    fetchQuiz();
    fetchExpertArticles();
  }, []);

  useEffect(() => {
    let interval: any;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && timerActive) {
      submitQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const fetchDailyContent = async () => {
    try {
      const [quoteRes, dealRes, tipRes, storyRes, techRes, videoRes] = await Promise.all([
        axios.get('/api/daily/quote'),
        axios.get('/api/daily/deals'),
        axios.get('/api/daily/tips'),
        axios.get('/api/daily/stories'),
        axios.get('/api/daily/tech'),
        axios.get('/api/daily/video')
      ]);
      setQuote(quoteRes.data);
      setDeal(dealRes.data);
      setTip(tipRes.data);
      setStory(storyRes.data);
      setTech(techRes.data);
      setVideo(videoRes.data);
    } catch (err) {
      console.error('Error fetching daily content', err);
    }
  };

  const fetchQuiz = async () => {
    try {
      const res = await axios.get('/api/daily/quiz');
      setQuizQuestions(res.data);
      setTimerActive(true);
      setTimer(300);
    } catch (err) {
      console.error('Error fetching quiz', err);
    }
  };

  const handleAnswer = (qid: string, idx: number) => {
    setQuizAnswers({ ...quizAnswers, [qid]: idx });
  };

  const submitQuiz = async () => {
    setTimerActive(false);
    const answers = Object.entries(quizAnswers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
    try {
      const res = await axios.post('/api/daily/quiz/submit', { answers, phoneNumber });
      setQuizResult(res.data);
      setQuizSubmitted(true);
    } catch (err) {
      console.error('Quiz submission error', err);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const fetchExpertArticles = async () => {
    const res = await axios.get('/api/daily/expert/list');
    setExpertArticles(res.data);
  };

  const submitExpertArticle = async () => {
    try {
      await axios.post('/api/daily/expert', newExpertArticle);
      alert('Article submitted for review');
      setNewExpertArticle({ title: '', content: '', author: '' });
      fetchExpertArticles();
    } catch (err) {
      alert('Submission failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Inspirational Quote */}
      <div className="bg-blue-100 p-4 rounded-lg mb-6 text-center">
        {quote ? (
          <>
            <p className="italic">“{quote.quote}”</p>
            <p className="text-sm text-gray-600">- {quote.author}</p>
          </>
        ) : (
          <p className="italic">“The secret of getting ahead is getting started.” — Mark Twain</p>
        )}
      </div>

      {/* Material Deal */}
      <div className="bg-green-100 p-4 rounded-lg mb-6">
        <h3 className="font-bold">🏗️ Today's Material Deal</h3>
        {deal ? (
          <p>{deal.material}: ₹{deal.rate} / {deal.unit}</p>
        ) : (
          <p>Check back tomorrow for fresh deals.</p>
        )}
      </div>

      {/* Daily Tip */}
      <div className="bg-yellow-100 p-4 rounded-lg mb-6">
        <h3 className="font-bold capitalize">✨ {tip?.category || 'Daily'} Tip</h3>
        {tip ? (
          <p>{tip.tip}</p>
        ) : (
          <p>Stay tuned for expert advice on business, family, health, and upscaling your life.</p>
        )}
      </div>

      {/* Success Story */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-xl">📖 Success Story</h3>
        {story ? (
          <>
            <p className="font-semibold">{story.title}</p>
            <p>{story.content}</p>
          </>
        ) : (
          <p>Real stories of transformation – be the first to experience one tomorrow.</p>
        )}
      </div>

      {/* Tech Article */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-xl">🔧 New Technology in Construction</h3>
        {tech ? (
          <>
            <p className="font-semibold">{tech.title}</p>
            <p>{tech.content}</p>
            <p className="text-sm text-gray-500">Source: {tech.source}</p>
          </>
        ) : (
          <p>Discover cutting‑edge innovations in civil engineering and project management.</p>
        )}
      </div>

      {/* Educational Video */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-xl">🎥 Educational Video</h3>
        {video ? (
          <>
            <p className="font-semibold">{video.title}</p>
            <div className="aspect-video mt-2">
              <iframe
                className="w-full h-full"
                src={video.url.replace('watch?v=', 'embed/')}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </>
        ) : (
          <p>Watch inspiring talks and tutorials – a new video awaits you tomorrow.</p>
        )}
      </div>

      {/* Daily Quiz */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-xl mb-2">📝 Daily Quiz (10 questions, 5 minutes)</h3>
        {!quizSubmitted ? (
          <>
            <div className="text-right text-red-600 font-bold">
              Time left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
            </div>
            {quizQuestions.length === 0 && <p>Loading questions...</p>}
            {quizQuestions.map((q, idx) => (
              <div key={q._id} className="border-t pt-3 mt-3">
                <p className="font-semibold">{idx + 1}. {q.question}</p>
                <div className="ml-4 space-y-1">
                  {q.options.map((opt: string, optIdx: number) => (
                    <label key={optIdx} className="block">
                      <input
                        type="radio"
                        name={`q-${q._id}`}
                        value={optIdx}
                        onChange={() => handleAnswer(q._id, optIdx)}
                        checked={quizAnswers[q._id] === optIdx}
                      /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4">
              <input
                type="tel"
                placeholder="Your WhatsApp Number (with country code)"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="border p-2 w-full mb-2"
              />
              <button
                onClick={submitQuiz}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={quizQuestions.length === 0}
              >
                Submit Quiz
              </button>
            </div>
          </>
        ) : (
          <div>
            <p>
              Your score: {quizResult?.score} / {quizResult?.total}
            </p>
            {quizResult?.perfect && (
              <p className="text-green-600">
                🎉 Perfect score! A certificate will be sent to your WhatsApp.
              </p>
            )}
            {!quizResult?.perfect && (
              <p>Try again tomorrow for a chance to earn a certificate.</p>
            )}
          </div>
        )}
      </div>

      {/* Expert Articles */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold text-xl mb-2">📚 Expert Articles</h3>
        {expertArticles.length === 0 && <p>No articles yet. Be the first to share your expertise!</p>}
        {expertArticles.map(art => (
          <div key={art._id} className="border-b py-2">
            <h4 className="font-bold">{art.title}</h4>
            <p>{art.content.substring(0, 150)}...</p>
            <p className="text-sm text-gray-500">By {art.author}</p>
          </div>
        ))}
        <details className="mt-4">
          <summary className="cursor-pointer text-blue-600">Share your expertise</summary>
          <div className="mt-2 space-y-2">
            <input
              type="text"
              placeholder="Title"
              className="border p-2 w-full"
              value={newExpertArticle.title}
              onChange={e => setNewExpertArticle({ ...newExpertArticle, title: e.target.value })}
            />
            <textarea
              placeholder="Content"
              rows={4}
              className="border p-2 w-full"
              value={newExpertArticle.content}
              onChange={e => setNewExpertArticle({ ...newExpertArticle, content: e.target.value })}
            />
            <input
              type="text"
              placeholder="Your Name"
              className="border p-2 w-full"
              value={newExpertArticle.author}
              onChange={e => setNewExpertArticle({ ...newExpertArticle, author: e.target.value })}
            />
            <button onClick={submitExpertArticle} className="bg-green-600 text-white px-4 py-2 rounded">
              Submit for Review
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};

export default DailyHub;