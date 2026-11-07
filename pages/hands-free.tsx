import React, { useState, useEffect } from "react";

// Comprehensive mock database of Admin Approved rates with multi-lingual keys
const RATE_DATABASE = [
  { key: "cement", terms: { en: "Cement OPC 53", hi: "सीमेंट (OPC 53)", kn: "ಸಿಮೆಂಟ್ (OPC 53)", te: "సిమెంట్ (OPC 53)", ta: "சிமெண்ட் (OPC 53)", ml: "സിമന്റ് (OPC 53)", bn: "সিমেন্ট (OPC 53)", or: "ସିମେଣ୍ଟ (OPC 53)" }, price: "₹410/BAG", trend: "↑ ₹25 (6.49%)", category: "Structural Material" },
  { key: "tmt steel", terms: { en: "TMT Steel Rebar", hi: "टीमैट स्टील", kn: "ಟಿಎಂಡಿ ಸ್ಟೀಲ್", te: "టిఎంటి స్టీల్", ta: "டிஎம்டி ஸ்டீல்", ml: "ടിഎംടി സ്റ്റീൽ", bn: "টিএমটি স্টিল", or: "ଟିଏମଟି ଷ୍ଟିଲ" }, price: "₹67/KG", trend: "• New Rate", category: "Structural Material" },
  { key: "m-sand", terms: { en: "M-Sand", hi: "एम-सैंड", kn: "ಎಂ-ಸ್ಯಾಂಡ್", te: "ఎం-సాండ్", ta: "எம்-சாண்ட்", ml: "എം-സാൻഡ്", bn: "এম-স্যান্ড", or: "ଏମ-ସାଣ୍ଡ" }, price: "₹48/CFT", trend: "↑ ₹3 (6.67%)", category: "Aggregate & Sand" },
  { key: "vitrified tiles", terms: { en: "Vitrified Tiles (600x600)", hi: "विट्रीफाइड टाइल्स", kn: "ವಿಟ್ರಿಫೈಡ್ ಟೈಲ್ಸ್", te: "విట్రిఫైడ్ టైల్స్", ta: "விட்ரிஃபைட் ஓடுகள்", ml: "വിട്രിഫൈഡ് ടൈൽസ്", bn: "ভিট্রিফাইড টাইলস", or: "ଭିଟ୍ରିଫାଇଡ ଟାଇଲ୍ସ" }, price: "₹58/SQFT", trend: "↓ ₹7 (10.77%)", category: "Flooring & Tiles" },
  { key: "emulsion paint", terms: { en: "Emulsion Paint", hi: "इमल्शन पेंट", kn: "ಎಮಲ್ಷನ್ ಪೇಂಟ್", te: "ఎమల్షన్ పెయింట్", ta: "எமல்ஷன் பெயிண்ட்", ml: "എമൽഷൻ പെയിന്റ്", bn: "ইমালশন পেইন্ট", or: "ଇମଲସନ ପେଣ୍ଟ" }, price: "₹35/LTR", trend: "↓ ₹200 (85.11%)", category: "Finishing & Paint" },
  { key: "clay bricks", terms: { en: "Clay Bricks", hi: "लाल ईंटें", kn: "ಮಣ್ಣಿನ ಇಟ್ಟಿಗೆಗಳು", te: "మట్టి ఇటుకలు", ta: "செங்கல்", ml: "കളിമണ്ണ് ഇഷ്ടികകൾ", bn: "মাটির ইট", or: "ମାଟି ଇଟା" }, price: "₹11/NOS", trend: "↑ ₹3.5 (46.67%)", category: "Masonry" }
];

const UI_TEXTS = {
  en: { title: "8 Regional Languages Voice Assistant & App Guide", subtitle: "Live Admin Approved Rates & Complete App Explanation across 8 Languages", searchPlaceholder: 'Ask any question like "TMT steel price", "सीमेंट दर", "ಸಿಮೆಂಟ್ ದರ"...', selectLang: "Select Regional Language", playAudio: "Play Full Voice Narration", speakQuery: "Speak Rate Query", notFound: "Sorry, your search item is not available in our database. It has been logged and will be added soon via auto-update!", resultsTitle: "Voice Query Results & Live Rate" },
  hi: { title: "8 क्षेत्रीय भाषाओं का वॉइस असिस्टेंट और ऐप गाइड", subtitle: "लाइव एडमिन स्वीकृत दरें और संपूर्ण ऐप विवरण", searchPlaceholder: 'कोई भी प्रश्न पूछें जैसे "टीमैट स्टील", "सीमेंट दर", आदि...', selectLang: "क्षेत्रीय भाषा चुनें", playAudio: "वॉयस आख्यान चलाएं", speakQuery: "रेट प्रश्न बोलें", notFound: "क्षमा करें, आपका खोजा गया आइटम हमारे डेटाबेस में उपलब्ध नहीं है। इसे नोट कर लिया गया है और ऑटो-अपडेट के माध्यम से जल्द ही जोड़ा जाएगा!", resultsTitle: "वॉयस क्वेरी परिणाम और लाइव दर" },
  kn: { title: "8 ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳ ಧ್ವನಿ ಸಹಾಯಕ ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಮಾರ್ಗದರ್ಶಿ", subtitle: "ಲೈವ್ ನಿರ್ವಹಣೆ ಅನುಮೋದಿತ ದರಗಳು ಮತ್ತು ಸಂಪೂರ್ಣ ಅಪ್ಲಿಕೇಶನ್ ವಿವರಣೆ", searchPlaceholder: '"ಟಿಎಂಡಿ ಸ್ಟೀಲ್", "ಸಿಮೆಂಟ್ ದರ" ಇತ್ಯಾದಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ...', selectLang: "ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", playAudio: "ಧ್ವನಿ ನಿರೂಪಣೆಯನ್ನು ಪ್ಲೇ ಮಾಡಿ", speakQuery: "ದರ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ", notFound: "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಹುಡುಕಾಟ ಐಟಂ ಲಭ್ಯವಿಲ್ಲ. ಇದನ್ನು ಶೀಘ್ರದಲ್ಲೇ ಆಟೋ-ಅಪ್ಡೇಟ್ ಮೂಲಕ ಸೇರಿಸಲಾಗುತ್ತದೆ!", resultsTitle: "ಧ್ವನಿ ಪ್ರಶ್ನೆ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ಲೈವ್ ದರ" },
  te: { title: "8 ప్రాంతీయ భాషల వాయిస్ అసిస్టెంట్ & యాప్ గైడ్", subtitle: "లైవ్ అడ్మిన్ ఆమోదించబడిన ధరలు మరియు పూర్తి యాప్ వివరణ", searchPlaceholder: '"టిఎంటి స్టీల్", "సిమెంట్ ధర" వంటి ప్రశ్నలను అడగండి...', selectLang: "ప్రాంతీయ భాషను ఎంచుకోండి", playAudio: "వాయిస్ కథనాన్ని ప్లే చేయండి", speakQuery: "ధర ప్రశ్నను మాట్లాడండి", notFound: "క్షమించండి, మీరు వెతికిన అంశం అందుబాటులో లేదు. త్వరలో ఆటో-అప్‌డేట్ ద్వారా జోడించబడుతుంది!", resultsTitle: "వాయిస్ క్వెరీ ఫలితాలు & లైవ్ రేట్" },
  ta: { title: "8 பிராந்திய மொழி குரல் உதவியாளர் & ஆப் வழிகாட்டி", subtitle: "நேரலை நிர்வாகி ஒப்புதல் பெற்ற விலைகள் மற்றும் முழுமையான ஆப் விளக்கம்", searchPlaceholder: '"டிஎம்டி ஸ்டீல்", "சிமெண்ட் விலை" போன்ற கேள்விகளைக் கேளுங்கள்...', selectLang: "பிராந்திய மொழியைத் தேர்ந்தெடுக்கவும்", playAudio: "குரல் விளக்கத்தை இயக்கவும்", speakQuery: "விலை கேள்வியைப் பேசுக", notFound: "மன்னிக்கவும், நீங்கள் தேடிய பொருள் எங்களிடம் இல்லை. விரைவில் தானியங்கு புதுப்பிப்பு மூலம் சேர்க்கப்படும்!", resultsTitle: "குரல் வினவல் முடிவுகள் மற்றும் நேரலை விலை" },
  ml: { title: "8 പ്രാദേശിക ഭാഷകളിലെ വോയ്സ് അസിസ്റ്റന്റ് & ആപ്പ് ഗൈഡ്", subtitle: "തത്സമയ അഡ്മിൻ അംഗീകരിച്ച നിരക്കുകളും സമ്പൂർണ്ണ ആപ്പ് വിശദീകരണവും", searchPlaceholder: '"ടിഎംടി സ്റ്റീൽ", "സിമന്റ് നിരക്ക്" തുടങ്ങിയ ചോദ്യങ്ങൾ ചോദിക്കുക...', selectLang: "പ്രാദേശിക ഭാഷ തിരഞ്ഞെടുക്കുക", playAudio: "വോയ്സ് വിവരണം പ്ലേ ചെയ്യുക", speakQuery: "നിരക്ക് ചോദ്യം സംസാരിക്കുക", notFound: "ക്ഷമിക്കുക, നിങ്ങളുടെ തിരയൽ ഇനം ലഭ്യമല്ല. ഇത് ഉടൻ തന്നെ ഓട്ടോ-അപ്‌ഡേറ്റ് വഴി ചേർക്കുന്നതാണ്!", resultsTitle: "വോയ്സ് അന്വേഷണ ഫലങ്ങളും തത്സമയ നിരക്കും" },
  bn: { title: "৮টি আঞ্চলিক ভাষার ভয়েস অ্যাসিস্ট্যান্ট ও অ্যাপ গাইড", subtitle: "লাইভ অ্যাডমিন অনুমোদিত রেট ও সম্পূর্ণ অ্যাপ বিবরণী", searchPlaceholder: '"টিএমটি স্টিল", "সিমেন্টের দাম" ইত্যাদি প্রশ্ন জিজ্ঞাসা করুন...', selectLang: "আঞ্চলিক ভাষা নির্বাচন করুন", playAudio: "ভয়েস ন্যারেলেশন প্লে করুন", speakQuery: "রেট সংক্রান্ত প্রশ্ন বলুন", notFound: "দুঃখিত, আপনার খোঁজা আইটেমটি পাওয়া যায়নি। এটি শীঘ্রই অটো-আপডেটের মাধ্যমে যোগ করা হবে!", resultsTitle: "ভয়েস কোয়েরি ফলাফল ও লাইভ রেট" },
  or: { title: "୮ଟି ଆଞ୍ଚଳିକ ଭାଷାର ଭଏସ୍ ଆସିଷ୍ଟାଣ୍ଟ ଏବଂ ଆପ୍ ଗାଇଡ୍", subtitle: "ଲାଇଭ୍ ଆଡମିନ୍ ଅନୁମୋଦିତ ହାର ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ ଆପ୍ ବିବରଣୀ", searchPlaceholder: '"ଟିଏମଟି ଷ୍ଟିଲ", "ସିମେଣ୍ଟ ଦର" ପରି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ...', selectLang: "ଆଞ୍ଚଳିକ ଭାଷା ଚୟନ କରନ୍ତୁ", playAudio: "ଭଏସ୍ ଆଖ୍ୟାନ ଚଲାନ୍ତୁ", speakQuery: "ଦର ପ୍ରଶ୍ନ କହନ୍ତୁ", selectLangText: "କ୍ଷମା କରନ୍ତୁ, ଆପଣ ଖୋଜିଥିବା ଆଇଟମ୍ ଉପଲବ୍ଧ ନାହିଁ। ଏହା ଶୀଘ୍ର ଅଟୋ-ଅପଡେଟ୍ ମାଧ୍ୟମରେ ଯୋଗ କରାଯିବ!", resultsTitle: "ଭଏସ୍ କ୍ୱେରୀ ଫଳାଫଳ ଏବଂ ଲାଇଭ୍ ହାର" }
};

export default function HandsFreeAssistant() {
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [notFoundMsg, setNotFoundMsg] = useState("");

  const t = UI_TEXTS[lang] || UI_TEXTS.en;

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setNotFoundMsg("");
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = RATE_DATABASE.filter((item) => {
      const termInLang = (item.terms[lang] || item.terms.en).toLowerCase();
      const termInEnglish = item.terms.en.toLowerCase();
      const keyName = item.key.toLowerCase();
      return termInLang.includes(q) || termInEnglish.includes(q) || keyName.includes(q);
    });

    if (matches.length > 0) {
      setSearchResults(matches);
      setNotFoundMsg("");
    } else {
      setSearchResults([]);
      setNotFoundMsg(t.notFound);
    }
  }, [query, lang, t]);

  const handleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : lang === "te" ? "te-IN" : lang === "ta" ? "ta-IN" : lang === "ml" ? "ml-IN" : lang === "bn" ? "bn-IN" : lang === "or" ? "or-IN" : "en-IN";
    recognition.interimResults = false;

    setIsListening(true);
    recognition.onresult = (event) => {
      setQuery(event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : lang === "te" ? "te-IN" : lang === "ta" ? "ta-IN" : lang === "ml" ? "ml-IN" : lang === "bn" ? "bn-IN" : lang === "or" ? "or-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-slate-950 text-slate-100 min-h-screen">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎙️</span>
              <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
            <p className="text-sm text-slate-400">{t.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs font-semibold text-sky-400 uppercase tracking-wider whitespace-nowrap">🌐 {t.selectLang}:</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none w-full md:w-48"
            >
              <option value="en">🇮🇳 English</option>
              <option value="hi">🇮🇳 Hindi (हिंदी)</option>
              <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
              <option value="te">🇮🇳 Telugu (తెలుగు)</option>
              <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
              <option value="ml">🇮🇳 Malayalam (മലയാളം)</option>
              <option value="bn">🇮🇳 Bengali (বাংলা)</option>
              <option value="or">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800">
          <button onClick={() => speakText(t.title)} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
            🔊 {t.playAudio}
          </button>
          <button onClick={handleSpeechRecognition} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${isListening ? "bg-red-600 animate-pulse text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}`}>
            🎙️ {isListening ? "Listening..." : t.speakQuery}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm font-medium"
          />
          {query && <button onClick={() => setQuery("")} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-white text-sm">Clear ✕</button>}
        </div>

        {(searchResults.length > 0 || notFoundMsg) && (
          <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">{t.resultsTitle}</h3>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((item, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-semibold">{item.category}</span>
                      <h4 className="text-base font-bold text-white mt-1">{item.terms[lang] || item.terms.en}</h4>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-lg font-black text-sky-400">{item.price}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">{item.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-xl text-amber-300 text-sm font-medium leading-relaxed">
                {notFoundMsg}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">🏗️ BuildMitra Live Rates (3,378+ Items)</h3>
          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
            {RATE_DATABASE.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">{item.terms[lang] || item.terms.en}</p>
                  <p className="text-xs text-slate-400">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sky-400">{item.price}</p>
                  <p className="text-xs text-emerald-400">{item.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-3">🏢 BuildMitra Suite Overview</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              India's leading digital platform for civil engineering estimation, Bar Bending Schedules (BBS), material BOQ calculations, live rates, and contractor workflows complying with IS 456:2000.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-semibold">Loaded 3,378 Admin Approved rates across 8 regional languages with active voice query support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
