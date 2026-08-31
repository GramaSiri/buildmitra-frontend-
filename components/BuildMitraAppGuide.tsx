import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English (India)', nativeName: 'English', flag: '🇮🇳' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' }
];

const GENERAL_APP_OVERVIEW: Record<string, string> = {
  'en-IN': "Welcome to BuildMitra Civil Construction Suite. BuildMitra is India's leading digital platform for civil engineering estimation, Bar Bending Schedules (BBS), material BOQ calculations, live rates, and contractor workflows. It prevents material wastage and guarantees 100% compliance with Indian Standard IS 456:2000, saving up to 15% total project cost.",
  'hi-IN': "बिल्डमित्रा सिविल निर्माण ऐप में आपका स्वागत है। बिल्डमित्रा भारत का प्रमुख डिजिटल प्लेटफॉर्म है जो भवन अनुमान, सरिया बीबीएस, सीमेंट-रेत मात्रा और लाइव दरों की गणना करता है। यह 15% तक सामग्री की बर्बादी को रोकता है और आईएस 456 का पालन करता है।",
  'kn-IN': "ಬಿಲ್ಡ್‌ಮಿತ್ರ ಸಿವಿಲ್ ನಿರ್ಮಾಣ ಅಪ್ಲಿಕೇಶನ್‌ಗೆ ಸುಸ್ವಾಗತ. ಬಿಲ್ಡ್‌ಮಿತ್ರ ಭಾರತದ ಪ್ರಮುಖ ಡಿಜಿಟಲ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಗಿದ್ದು, ಕಟ್ಟಡ ಅಂದಾಜು, ಸ್ಟೀಲ್ BBS ಲೆಕ್ಕಾಚಾರ, ಸಿಮೆಂಟ್-ಮರಳು ಪ್ರಮಾಣ ಮತ್ತು ಲೈವ್ ದರಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ. ಇದು ಕಟ್ಟಡ ಸಾಮಗ್ರಿಗಳ ವ್ಯರ್ಥವನ್ನು ತಡೆಯುತ್ತದೆ ಮತ್ತು 15% ರಷ್ಟು ಹಣ ಉಳಿಸುತ್ತದೆ.",
  'te-IN': "బిల్డ్ మిత్ర సివిల్ నిర్మాణ యాప్‌కు స్వాగతం. బిಲ್డ్ మిత్ర అనేది భవన అంచనాలు, స్టీల్ BBS, సిమెంట్-ఇసుక పరిమాణం మరియు లైవ్ ధరలను లెక్కిస్తుంది. ఇది నిర్మాణ వ్యయాన్ని 15% వరకు ఆదా చేస్తుంది.",
  'ta-IN': "பில்ட்மித்ரா சிவில் கட்டுமான செயலிகளுக்கு வரவேற்கிறோம். பில்ட்மித்ரா கட்டிட மதிப்பீடு, கம்பி BBS மற்றும் நேரலை விலைகளை துல்லியமாக கணக்கிடுகிறது. இது 15% பொருள் சேமிப்பை வழங்குகிறது.",
  'ml-IN': "ബിൽഡ് മിത്ര സിവിൽ നിർമ്മാണ ആപ്പിലേക്ക് സ്വാഗതം. ബിൽഡ് മിത്ര കെട്ടിട അഗ്രഗേറ്റുകൾ, കമ്പി BBS, സിമന്റ്-മണൽ അളവുകൾ എന്നിവ കൃത്യമായി കണക്കാക്കുന്നു. ഇത് 15% തുക ലാഭിക്കാൻ സഹായിക്കുന്നു.",
  'bn-IN': "বিল্ডমিত্র সিভিল কনস্ট্রাকশন অ্যাপে স্বাগতম। বিল্ডমিত্র বিল্ডিং প্রাক্কলন, রড BBS এবং লাইভ রেট নিখুঁতভাবে হিসেব করে ১৫% পর্যন্ত খরচ বাঁচায়।",
  'or-IN': "ବିଲ୍ଡମିତ୍ର ସିଭିଲ୍ ନିର୍ମାଣ ଆପ୍ କୁ ସ୍ୱାଗତ | ବିଲ୍ଡମିତ୍ର କୋଠା ଆକଳନ, ରଡ୍ BBS ଏବଂ ଲାଇଭ୍ ଦର ଗଣନା କରେ, ଯାହା ୧୫% ପର୍ଯ୍ୟନ୍ତ ଖର୍ଚ୍ଚ କମାଏ |"
};

interface ModuleGuide {
  id: string;
  title: string;
  icon: string;
  path: string;
  why: Record<string, string>;
  where: Record<string, string>;
  when: Record<string, string>;
  whom: Record<string, string>;
  howToFill: Record<string, string>;
  benefits: Record<string, string>;
}

const APP_GUIDES: ModuleGuide[] = [
  {
    id: 'steel',
    title: 'RCC Steel & BBS Calculator',
    icon: '🏗️',
    path: '/steel-calculator',
    why: {
      'en-IN': 'Eliminates rebar wastage (saves up to 15% steel cost) and calculates exact Bar Bending Schedule (BBS) as per IS 456:2000.',
      'hi-IN': 'सरिया की बर्बादी को समाप्त करता है (15% तक लागत बचाता है) और IS 456:2000 के अनुसार सटीक बीबीएस की गणना करता है।',
      'kn-IN': 'ಉಕ್ಕಿನ ವ್ಯರ್ಥವನ್ನು ತಡೆಯುತ್ತದೆ (15% ವರೆಗೆ ಉಳಿತಾಯ) ಮತ್ತು IS 456 ಪ್ರಕಾರ ನಿಖರ BBS ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.',
      'te-IN': 'ఉక్కు వృథాను నివారిస్తుంది (15% వరకు ఆదా) మరియు IS 456 ప్రకారం ఖచ్చితమైన BBS లెక్కిస్తుంది.',
      'ta-IN': 'கம்பி வீணாவதை தடுக்கிறது (15% வரை சேமிப்பு) மற்றும் IS 456 படி துல்லியமான BBS கணக்கிடுகிறது.',
      'ml-IN': 'കമ്പി പാഴാകുന്നത് തടയുന്നു (15% വരെ ലാഭം) കൂടാതെ IS 456 പ്രകാരം കൃത്യമായ BBS കണക്കാക്കുന്നു.',
      'bn-IN': 'রড অপচয় দূর করে (১৫% পর্যন্ত সাশ্রয়) এবং IS 456 অনুযায়ী সঠিক BBS হিসেব করে।',
      'or-IN': 'ରଡ୍ ନଷ୍ଟ ରୋକିଥାଏ (୧୫% ପର୍ଯ୍ୟନ୍ତ ସଞ୍ଚୟ) ଏବଂ IS 456 ଅନୁଯାୟୀ ସଠିକ୍ BBS ଗଣନା କରେ |'
    },
    where: {
      'en-IN': 'Used for Footing, Column, Beam, Slab, Lintel, and RCC Retaining Wall structural reinforcement steel work.',
      'hi-IN': 'फुटिंग, कॉलम, बीम, स्लैब, लिंटेल और आरसीसी दीवार सरिया कार्य के लिए उपयोग किया जाता है।',
      'kn-IN': 'ಫುಟಿಂಗ್, ಕಾಲಮ್, ಬೀಮ್, ಸ್ಲ್ಯಾಬ್, ಲಿಂಟೆಲ್ ಮತ್ತು RCC ಗೋಡೆ ಸ್ಟೀಲ್ ಕೆಲಸಗಳಿಗೆ ಬಳಸಲಾಗುತ್ತದೆ.',
      'te-IN': 'ఫుటింగ్, కాలమ్, బీమ్, స్లాబ్, లింటెల్ మరియు RCC గోడ స్టీల్ పనులకు ఉపయోగిస్తారు.',
      'ta-IN': 'அடித்தளம், தூண், பீம், கூரை, லிண்டல் மற்றும் RCC சுவர் பணிகளுக்கு பயன்படுத்தப்படுகிறது.',
      'ml-IN': 'ഫൂട്ടിംഗ്, കോളം, ബീം, സ്ലാബ്, ലിന്റൽ, ആർസിസി വാൾ കമ്പി ജോലികൾക്ക് ഉപയോഗിക്കുന്നു.',
      'bn-IN': 'ফুটিং, কলাম, বিম, স্ল্যাব, লিন্টেল এবং আরসিসি দেয়ালের রডের কাজের জন্য ব্যবহৃত হয়।',
      'or-IN': 'ଫୁଟିଙ୍ଗ୍, କଲମ୍, ବିମ୍, ସ୍ଲାବ୍, ଲିଣ୍ଟେଲ୍ ଏବଂ RCC କାନ୍ଥ ରଡ୍ କାମ ପାଇଁ ବ୍ୟବହୃତ ହୁଏ |'
    },
    when: {
      'en-IN': 'Before purchasing TMT rebar steel, before cutting/bending rods, and during BOQ structural budget estimation.',
      'hi-IN': 'सरिया खरीदने से पहले, कटाई/मोड़ने से पहले और बीओक्यू बजट अनुमान के दौरान।',
      'kn-IN': 'ಸ್ಟೀಲ್ ಖರೀದಿಸುವ ಮುನ್ನ, ಕತ್ತರಿಸುವ ಮುನ್ನ ಮತ್ತು BOQ ಬಜೆಟ್ ಅಂದಾಜಿನ ಸಮಯದಲ್ಲಿ.',
      'te-IN': 'స్టీల్ కొనుగోలుకు ముందు, కటింగ్/బెండింగ్‌కు ముందు మరియు BOQ అంచనా సమయంలో.',
      'ta-IN': 'கம்பி வாங்குவதற்கு முன், வெட்டுவதற்கு முன் மற்றும் BOQ மதிப்பீட்டின் போது.',
      'ml-IN': 'കമ്പി വാങ്ങുന്നതിന് മുമ്പും, മുറിക്കുന്നതിന് മുമ്പും, BOQ ബജറ്റ് കണക്കാക്കുമ്പോഴും.',
      'bn-IN': 'রড কেনার আগে, কাটার আগে এবং বিওকিউ বাজেট হিসেবের সময়।',
      'or-IN': 'ରଡ୍ କିଣିବା ପୂର୍ବରୁ, କାଟିବା ପୂର୍ବରୁ ଏବଂ BOQ ବଜେଟ୍ ଆକଳନ ସମୟରେ |'
    },
    whom: {
      'en-IN': 'Civil Engineers, Bar Benders, Contractors, Home Owners, Structural Designers, Project Managers.',
      'hi-IN': 'सिविल इंजीनियर, बार बेंडर, ठेकेदार, मकान मालिक, स्ट्रक्चरल डिजाइनर।',
      'kn-IN': 'ಸಿವಿಲ್ ಎಂಜಿನಿಯರ್‌ಗಳು, ಬಾರ್ ಬೆಂಡರ್‌ಗಳು, ಗುತ್ತಿಗೆದಾರರು, ಮನೆ ಮಾಲೀಕರು.',
      'te-IN': 'సివిల్ ఇంజనీర్లు, బార్ బెండర్లు, కాంట్రాక్టర్లు, ఇంటి యజమానులు.',
      'ta-IN': 'சிவில் பொறியாளர்கள், கம்பி கட்டுபவர்கள், ஒப்பந்ததாரர்கள், வீட்டு உரிமையாளர்கள்.',
      'ml-IN': 'സിവിൽ എഞ്ചിനീയർമാർ, ബാർ ബെൻഡർമാർ, കോൺട്രാക്ടർമാർ, വീടുടമകൾ.',
      'bn-IN': 'সিভিল ইঞ্জিনিয়ার, রড মিস্ত্রি, ঠিকাদার, বাড়ির মালিক।',
      'or-IN': 'ସିଭିଲ୍ ଇଞ୍ଜିନିୟର୍, ରଡ୍ ମିସ୍ତ୍ରୀ, ଠିକାଦାର, ଘର ମାଲିକ |'
    },
    howToFill: {
      'en-IN': '1. Select Structural Member (Beam, Column, Slab, Footing). 2. Enter Span Length, Width, Depth in feet/meters. 3. Enter Main Bottom/Top Bar Diameters (e.g. 12mm, 16mm) and Number of Bars. 4. Enter Stirrup Diameter (e.g. 8mm) and Spacing. 5. Click Calculate to generate complete BBS.',
      'hi-IN': '1. संरचनात्मक सदस्य (बीम, कॉलम, स्लैब, फुटिंग) चुनें। 2. लंबाई, चौड़ाई, गहराई दर्ज करें। 3. मुख्य निचली/ऊपरी छड़ का व्यास (12mm, 16mm) और संख्या दर्ज करें। 4. स्टिरअप व्यास और रिक्ति दर्ज करें। 5. गणना करें पर क्लिक करें।',
      'kn-IN': '1. ಸದಸ್ಯರ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ (ಬೀಮ್, ಕಾಲಮ್, ಸ್ಲ್ಯಾಬ್). 2. ಉದ್ದ, ಅಗಲ, ಆಳ ನಮೂದಿಸಿ. 3. ಮೇಲ್ಭಾಗ ಮತ್ತು ಕೆಳಭಾಗದ ರಾಡ್ ವ್ಯಾಸ (12mm, 16mm) ಮತ್ತು ಸಂಖ್ಯೆ ನಮೂದಿಸಿ. 4. ಸ್ಟಿರಪ್ ವ್ಯಾಸ ಮತ್ತು ಅಂತರ ನಮೂದಿಸಿ. 5. ಲೆಕ್ಕಾಚಾರ ಕ್ಲಿಕ್ ಮಾಡಿ.',
      'te-IN': '1. నిర్మాణాత్మక రకం ఎంచుకోండి (బీమ్, కాలమ్, స్లాబ్). 2. పొడవు, వెడల్పు, లోతు నమోదు చేయండి. 3. ప్రధాన రాడ్ వ్యాసం (12mm, 16mm) మరియు సంఖ్య నమోదు చేయండి. 4. రింగుల వ్యాసం మరియు దూరం నమోదు చేయండి. 5. లెక్కించు క్లిక్ చేయండి.',
      'ta-IN': '1. உறுப்பினர் வகை தேர்ந்தெடுக்கவும் (பீம், தூண், கூரை). 2. நீளம், அகலம், ஆழம் உள்ளிடவும். 3. கம்பி விட்டம் (12mm, 16mm) மற்றும் எண்ணிக்கை உள்ளிடவும். 4. ரிங் விட்டம் மற்றும் இடைவெளி உள்ளிடவும். 5. கணக்கிடு கிளிக் செய்யவும்.',
      'ml-IN': '1. ടൈപ്പ് തിരഞ്ഞെടുക്കുക (ബീം, കോളം, സ്ലാബ്). 2. നീളം, വീതി, ആഴം നൽകുക. 3. കമ്പി വ്യാസവും (12mm, 16mm) എണ്ണവും നൽകുക. 4. റിംഗ് വ്യാസവും അകലവും നൽകുക. 5. കണക്കാക്കുക ക്ലിക്ക് ചെയ്യുക.',
      'bn-IN': '১. মেম্বার টাইপ চয়ন করুন (বিম, কলাম, স্ল্যাব)। ২. দৈর্ঘ্য, প্রস্থ, গভীরতা দিন। ৩. রডের ব্যাস (১২ মিমি, ১৬ মিমি) ও সংখ্যা দিন। ৪. স্টাইরাপের ব্যাস ও দূরত্ব দিন। ৫. ক্যালকুলেট ক্লিক করুন।',
      'or-IN': '୧. ପ୍ରକାର ବାଛନ୍ତୁ (ବିମ୍, କଲମ୍, ସ୍ଲାବ୍) | ୨. ଲମ୍ବ, ଓସାର, ଗଭୀରତା ଦିଅନ୍ତୁ | ୩. ରଡ୍ ବ୍ୟାସ (୧୨mm, ୧୬mm) ଏବଂ ସଂଖ୍ୟା ଦିଅନ୍ତୁ | ୪. ରିଙ୍ଗ୍ ବ୍ୟାସ ଏବଂ ଦୂରତା ଦିଅନ୍ତୁ | ୫. ଗଣନା କ୍ଲିକ୍ କରନ୍ତୁ |'
    },
    benefits: {
      'en-IN': '🚀 Saves up to ₹85,000 per floor on steel wastage | 100% IS 456:2000 compliant | Instant 12m stock requirement report.',
      'hi-IN': '🚀 प्रति मंजिल ₹85,000 तक की बचत | 100% IS 456 अनुपालन | तत्काल 12 मीटर स्टॉक रिपोर्ट।',
      'kn-IN': '🚀 ಪ್ರತಿ ಫ್ಲೋರ್‌ಗೆ ₹85,000 ವರೆಗೆ ಉಳಿತಾಯ | 100% IS 456 ಅನುಸರಣೆ | 12m ಸ್ಟಾಕ್ ವರದಿ.',
      'te-IN': '🚀 ప్రతి ఫ్లోర్‌కు ₹85,000 వరకు ఆదా | 100% IS 456 పాటింపు | 12m స్టాక్ నివేదిక.',
      'ta-IN': '🚀 ஒரு தளத்திற்கு ₹85,000 வரை சேமிப்பு | 100% IS 456 இணக்கம் | 12m ஸ்டாக் அறிக்கை.',
      'ml-IN': '🚀 ഒരു നിലയ്ക്ക് ₹85,000 വരെ ലാഭം | 100% IS 456 അനുസൃതം | 12m സ്റ്റോക്ക് റിപ്പോർട്ട്.',
      'bn-IN': '🚀 প্রতি তলায় ₹৮৫,০০০ পর্যন্ত সাশ্রয় | ১০০% IS 456 সম্মত | তাতক্ষণিক ১২ মিটার স্টক রিপোর্ট।',
      'or-IN': '🚀 ପ୍ରତି ଫ୍ଲୋରରେ ₹୮୫,୦୦୦ ପର୍ଯ୍ୟନ୍ତ ସଞ୍ଚୟ | ୧୦୦% IS 456 ଅନୁଯାୟୀ | ୧୨m ଷ୍ଟକ୍ ରିପୋର୍ଟ |'
    }
  },
  {
    id: 'concrete',
    title: 'Concrete & RMC Estimator',
    icon: '🧱',
    path: '/concrete-calculator',
    why: {
      'en-IN': 'Calculates exact cement bags, sand CFT, and aggregate CFT for M15, M20, M25 mix design or RMC ready-mix volume.',
      'hi-IN': 'M15, M20, M25 मिक्स डिजाइन या आरएमसी के लिए सीमेंट बैग, रेत और गिट्टी की सटीक मात्रा की गणना करता है।',
      'kn-IN': 'M15, M20, M25 ಕಾಂಕ್ರೀಟ್ ಮಿಶ್ರಣಕ್ಕೆ ಸಿಮೆಂಟ್ ಚೀಲಗಳು, ಮರಳು ಮತ್ತು ಜಲ್ಲಿಯನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕುತ್ತದೆ.',
      'te-IN': 'M15, M20, M25 కాంక్రీట్ మిశ్రమానికి సిమెంట్ సంచులు, ఇసుక మరియు జెల్లీని లెక్కిస్తుంది.',
      'ta-IN': 'M15, M20, M25 கலவைக்கு சிமெண்ட் மூடிகள், மணல் மற்றும் ஜெல்லியை துல்லியமாக கணக்கிடுகிறது.',
      'ml-IN': 'M15, M20, M25 മിക്സിന് സിമന്റ് ചാക്കുകൾ, മണൽ, ജെല്ലി എന്നിവ കൃത്യമായി കണക്കാക്കുന്നു.',
      'bn-IN': 'M15, M20, M25 মিক্স ডিজাইনের জন্য সিমেন্ট বস্তা, বালি এবং পাথর হিসেব করে।',
      'or-IN': 'M15, M20, M25 ମିଶ୍ରଣ ପାଇଁ ସିମେଣ୍ଟ ବସ୍ତା, ବାଲି ଏବଂ ଗିଟି ଗଣନା କରେ |'
    },
    where: {
      'en-IN': 'Used for Foundation Footings, Columns, Plinth Beams, Roof Slabs, Staircases, and Retaining Walls.',
      'hi-IN': 'फाउंडेशन फुटिंग, कॉलम, प्लिंथ बीम, छत स्लैब, सीढ़ियों और रिटेनिंग दीवारों के लिए।',
      'kn-IN': 'ಫೌಂಡೇಶನ್, ಕಾಲಮ್, ಬೀಮ್, ರೂಫ್ ಸ್ಲ್ಯಾಬ್, ಮೆಟ್ಟಿಲುಗಳು ಮತ್ತು ಗೋಡೆಗಳಿಗೆ.',
      'te-IN': 'ఫౌండేషన్, కాలమ్, బీమ్, రూఫ్ స్లాబ్, మెట్లు మరియు గోడలకు.',
      'ta-IN': 'அடித்தளம், தூண், பீம், கூரை, படிக்கட்டுகள் மற்றும் சுவர்களுக்கு.',
      'ml-IN': 'ഫൗണ്ടേഷൻ, കോളം, ബീം, റൂഫ് സ്ലാബ്, സ്റ്റെയർകേസ്, ആർസിസി വാൾ എന്നിവയ്ക്ക്.',
      'bn-IN': 'ফাউন্ডേഷൻ, কলাম, বিম, ছাদ, সিঁড়ি এবং দেয়ালের জন্য।',
      'or-IN': 'ଫାଉଣ୍ଡେସନ୍, କଲମ୍, ବିମ୍, ଛାତ, ସିଡ଼ି ଏବଂ କାନ୍ଥ ପାଇଁ |'
    },
    when: {
      'en-IN': 'Before ordering RMC concrete transit mixers and before purchasing bulk cement, sand, and jelly.',
      'hi-IN': 'आरएमसी कंक्रीट ऑर्डर करने से पहले और सीमेंट, रेत, गिट्टी खरीदने से पहले।',
      'kn-IN': 'RMC ಆರ್ಡರ್ ಮಾಡುವ ಮುನ್ನ ಮತ್ತು ಸಿಮೆಂಟ್, ಮರಳು, ಜಲ್ಲಿ ಖರೀದಿಸುವ ಮುನ್ನ.',
      'te-IN': 'RMC ఆర్డర్ చేయడానికి ముందు మరియు సిమెంట్, ఇసుక కొనుగోలుకు ముందు.',
      'ta-IN': 'RMC ஆர்டர் செய்வதற்கு முன் மற்றும் சிமெண்ட், மணல் வாங்குவதற்கு முன்.',
      'ml-IN': 'RMC ഓർഡർ ചെയ്യുന്നതിന് മുമ്പും സിമന്റ്, മണൽ വാങ്ങുന്നതിന് മുമ്പും.',
      'bn-IN': 'আরএমসি অর্ডার করার আগে এবং সিমেন্ট, বালি কেনার আগে।',
      'or-IN': 'RMC ଅର୍ଡର କରିବା ପୂର୍ବରୁ ଏବଂ ସିମେଣ୍ଟ, ବାଲି କିଣିବା ପୂର୍ବରୁ |'
    },
    whom: {
      'en-IN': 'Contractors, Site Engineers, Home Builders, RMC Suppliers, Masonry Supervisors.',
      'hi-IN': 'ठेकेदार, साइट इंजीनियर, गृह निर्माता, आरएमसी आपूर्तिकर्ता।',
      'kn-IN': 'ಗುತ್ತಿಗೆದಾರರು, ಸೈಟ್ ಎಂಜಿನಿಯರ್‌ಗಳು, ಮನೆ ನಿರ್ಮಿಸುವವರು, RMC ಪೂರೈಕೆದಾರರು.',
      'te-IN': 'కాంట్రాక్టర్లు, సైట్ ఇంజనీర్లు, ఇల్లు నిర్మించేవారు, RMC సరఫరాదారులు.',
      'ta-IN': 'ஒப்பந்ததாரர்கள், தள பொறியாளர்கள், வீடு கட்டுபவர்கள், RMC விநியோகஸ்தர்கள்.',
      'ml-IN': 'കോൺട്രാക്ടർമാർ, സൈറ്റ് എഞ്ചിനീയർമാർ, വീട് നിർമ്മിക്കുന്നവർ.',
      'bn-IN': 'ঠিকাদার, সাইট ইঞ্জিনিয়ার, বাড়ি নির্মাণকারী, আরএমসি সরবরাহকারী।',
      'or-IN': 'ଠିକାଦାର, ସାଇଟ୍ ଇଞ୍ଜିନିୟର୍, ଘର ନିର୍ମାତା |'
    },
    howToFill: {
      'en-IN': '1. Enter Concrete Member Dimensions: Length, Width, Height/Thickness in Feet or Meters. 2. Select Concrete Grade (M15, M20, M25, M30). 3. View instant summary: Total Concrete Volume in CFT/Cum, Required Cement Bags, Sand CFT, and Aggregate CFT with live Admin cost.',
      'hi-IN': '1. कंक्रीट आयाम दर्ज करें: लंबाई, चौड़ाई, ऊंचाई/मोटाई। 2. कंक्रीट ग्रेड (M20, M25) चुनें। 3. सीमेंट बैग, रेत और गिट्टी की आवश्यक मात्रा और लागत देखें।',
      'kn-IN': '1. ಕಾಂಕ್ರೀಟ್ ಅಳತೆಗಳನ್ನು ನಮೂದಿಸಿ: ಉದ್ದ, ಅಗಲ, ಎತ್ತರ/ಘನತೆ. 2. ಕಾಂಕ್ರೀಟ್ ಗ್ರೇಡ್ ಆಯ್ಕೆಮಾಡಿ (M20, M25). 3. ಅಗತ್ಯವಿರುವ ಸಿಮೆಂಟ್ ಚೀಲಗಳು, ಮರಳು ಮತ್ತು ಜಲ್ಲಿ ಪ್ರಮಾಣವನ್ನು ವೀಕ್ಷಿಸಿ.',
      'te-IN': '1. కాంక్రీట్ కొలతలు నమోదు చేయండి: పొడవు, వెడల్పు, ఎత్తు. 2. గ్రేడ్ ఎంచుకోండి (M20, M25). 3. అవసరమైన సిమెంట్ సంచులు, ఇసుక మరియు జెల్లీ చూడండి.',
      'ta-IN': '1. பரிமாணங்களை உள்ளிடவும்: நீளம், அகலம், உயரம். 2. தரம் தேர்ந்தெடுக்கவும் (M20, M25). 3. தேவையான சிமெண்ட் மூடிகள், மணல் மற்றும் ஜெல்லி பார்க்கவும்.',
      'ml-IN': '1. അളവുകൾ നൽകുക: നീളം, വീതി, ഉയരം. 2. ഗ്രേഡ് തിരഞ്ഞെടുക്കുക (M20, M25). 3. സിമന്റ് ചാക്കുകൾ, മണൽ, ജെല്ലി എന്നിവ കാണുക.',
      'bn-IN': '১. কংক্রিটের পরিমাপ দিন: দৈর্ঘ্য, প্রস্থ, উচ্চতা। ২. গ্রেড চয়ন করুন (M20, M25)। ৩. প্রয়োজনীয় সিমেন্ট বস্তা, বালি এবং পাথর দেখুন।',
      'or-IN': '୧. ପରିମାଣ ଦିଅନ୍ତୁ: ଲମ୍ବ, ଓସାର, ଉଚ୍ଚତା | ୨. ଗ୍ରେଡ୍ ବାଛନ୍ତୁ (M20, M25) | ୩. ସିମେଣ୍ଟ ବସ୍ତା, ବାଲି ଏବଂ ଗିଟି ପରିମାଣ ଦେଖନ୍ତୁ |'
    },
    benefits: {
      'en-IN': '🔥 Prevents concrete shortage mid-casting | Accurate cement-sand-jelly ratio | Live Admin Rate costing.',
      'hi-IN': '🔥 ढलाई के बीच में कंक्रीट की कमी को रोकता है | सटीक अनुपात | लाइव एडमिन दर लागत।',
      'kn-IN': '🔥 ಕಾಂಕ್ರೀಟ್ ಕೊರತೆಯನ್ನು ತಡೆಯುತ್ತದೆ | ನಿಖರ ಪ್ರಮಾಣ | ಲೈವ್ ದರ ಲೆಕ್ಕಾಚಾರ.',
      'te-IN': '🔥 కాంక్రీట్ కొరతను నివారిస్తుంది | ఖచ్చితమైన నిష్పత్తి | లైవ్ ధర లెక్కింపు.',
      'ta-IN': '🔥 கான்கிரீட் பற்றாக்குறையை தடுக்கிறது | துல்லியமான விகிதம் | நேரலை விலை.',
      'ml-IN': '🔥 കോൺക്രീറ്റ് കുറയുന്നത് തടയുന്നു | കൃത്യമായ അനുപാതം | തത്സമയ നിരക്ക്.',
      'bn-IN': '🔥 ঢালাইয়ের মাঝে কংক্রিটের ঘাটতি রোধ করে | সঠিক অনুপাত | লাইভ রেট।',
      'or-IN': '🔥 ଢଳାଇ ମଝିରେ କଂକ୍ରିଟ୍ ଅଭାବ ରୋକିଥାଏ | ସଠିକ୍ ଅନୁପାତ | ଲାଇଭ୍ ଦର |'
    }
  },
  {
    id: 'brick',
    title: 'Brick & AAC Block Estimator',
    icon: '🧱',
    path: '/brick-calculator',
    why: {
      'en-IN': 'Calculates exact total count of Clay Bricks, Solid Blocks, or AAC Blocks along with mortar cement and sand.',
      'hi-IN': 'मसाले के सीमेंट और रेत के साथ लाल ईंटों, ठोस ब्लॉक या एएसी ब्लॉक की सटीक संख्या की गणना करता है।',
      'kn-IN': 'ಸಿಮೆಂಟ್ ಮತ್ತು ಮರಳಿನೊಂದಿಗೆ ಕೆಂಪು ಇಟ್ಟಿಗೆಗಳು ಅಥವಾ AAC ಬ್ಲಾಕ್‌ಗಳ ನಿಖರ ಸಂಖ್ಯೆಯನ್ನು ಲೆಕ್ಕಹಾಕುತ್ತದೆ.',
      'te-IN': 'సిమెంట్ మరియు ఇసుకతో ఎర్ర ఇటుకలు లేదా AAC బ్లాకుల ఖచ్చితమైన సంఖ్యను లెక్కిస్తుంది.',
      'ta-IN': 'சிமெண்ட் மற்றும் மணலுடன் செங்கற்கள் அல்லது AAC பிளாக்குகளின் எண்ணிக்கையை கணக்கிடுகிறது.',
      'ml-IN': 'സിമന്റും മണലും അടക്കം ഇഷ്ടികകളുടെയോ എഎസി ബ്ലോക്കുകളുടെയോ കൃത്യമായ എണ്ണം കണക്കാക്കുന്നു.',
      'bn-IN': 'সিমেন্ট ও বালির হিসেবসহ লাল ইট বা এএসি ব্লকের সঠিক সংখ্যা গণনা করে।',
      'or-IN': 'ମସଲା ସିମେଣ୍ଟ ଏବଂ ବାଲି ସହିତ ଇଟା କିମ୍ବା AAC ବ୍ଲକର ସଠିକ୍ ସଂଖ୍ୟା ଗଣନା କରେ |'
    },
    where: {
      'en-IN': 'Used for Exterior 9-inch Walls, Partition 4.5-inch Walls, Compound Walls, and Parapet Walls.',
      'hi-IN': 'बाहरी 9-इंच की दीवारों, विभाजन 4.5-इंच की दीवारों, बाउंड्री वॉल और पैरापेट दीवारों के लिए।',
      'kn-IN': 'ಹೊರಗಿನ 9-ಇಂಚಿನ ಗೋಡೆಗಳು, ಒಳಗಿನ 4.5-ಇಂಚಿನ ಗೋಡೆಗಳು ಮತ್ತು ಕಾಂಪೌಂಡ್ ಗೋಡೆಗಳಿಗೆ.',
      'te-IN': 'బయటి 9-అంగుళాల గోడలు, లోపలి 4.5-అంగుళాల గోడలు మరియు కాంపౌಂಡ್ గోడలకు.',
      'ta-IN': 'வெளிப்புற 9-இன்ச் சுவர்கள், உட்புற 4.5-இன்ச் சுவர்கள் மற்றும் காம்பவுண்ட் சுவர்களுக்கு.',
      'ml-IN': 'പുറത്തെ 9-ഇഞ്ച് ചുമരുകൾ, അകത്തെ 4.5-ഇഞ്ച് ചുമരുകൾ, കോമ്പൗണ്ട് ചുമരുകൾ എന്നിവയ്ക്ക്.',
      'bn-IN': 'বাইরের ৯-ইঞ্চি দেয়াল, ভিতরের ৪.৫-ইঞ্চি দেয়াল এবং বাউন্ডারি দেয়ালের জন্য।',
      'or-IN': 'ବାହାର ୯-ଇଞ୍ଚ କାନ୍ଥ, ଭିତର ୪.୫-ଇଞ୍ଚ କାନ୍ଥ ଏବଂ ବାଉଣ୍ଡରୀ କାନ୍ଥ ପାଇଁ |'
    },
    when: {
      'en-IN': 'Before procuring bricks/blocks from suppliers and before mason agreement negotiation.',
      'hi-IN': 'आपूर्तिकर्ताओं से ईंटें/ब्लॉक खरीदने से पहले और राजमिस्त्री समझौते से पहले।',
      'kn-IN': 'ಇಟ್ಟಿಗೆಗಳನ್ನು ಖರೀದಿಸುವ ಮುನ್ನ ಮತ್ತು ಮೇಸ್ತ್ರಿ ಒಪ್ಪಂದದ ಮುನ್ನ.',
      'te-IN': 'ఇటుకలు కొనుగోలు చేయడానికి ముందు మరియు మేస్త్రీ ఒప్పందానికి ముందు.',
      'ta-IN': 'செங்கற்கள் வாங்குவதற்கு முன் மற்றும் மேஸ்திரி ஒப்பந்தத்திற்கு முன்.',
      'ml-IN': 'ഇഷ്ടികകൾ വാങ്ങുന്നതിന് മുമ്പും മേസ്തിരി കരാറിന് മുമ്പും.',
      'bn-IN': 'ইট কেনার আগে এবং রাজমিস্ত্রি চুক্তির আগে।',
      'or-IN': 'ଇଟା କିଣିବା ପୂର୍ବରୁ ଏବଂ ମିସ୍ତ୍ରୀ ଚୁକ୍ତି ପୂର୍ବରୁ |'
    },
    whom: {
      'en-IN': 'Building Masons, Civil Contractors, House Owners, Material Vendors.',
      'hi-IN': 'भवन निर्माता, नागरिक ठेकेदार, मकान मालिक, सामग्री विक्रेता।',
      'kn-IN': 'ಕಟ್ಟಡ ಮೇಸ್ತ್ರಿಗಳು, ಸಿವಿಲ್ ಗುತ್ತಿಗೆದಾರರು, ಮನೆ ಮಾಲೀಕರು.',
      'te-IN': 'భవన మేస్త్రీలు, సివిಲ್ కాంట్రాక్టర్లు, ఇంటి యజమానులు.',
      'ta-IN': 'கட்டிட மேஸ்திரிகள், சிவில் ஒப்பந்ததாரர்கள், வீட்டு உரிமையாளர்கள்.',
      'ml-IN': 'കെട്ടിട മേസ്തിരിമാർ, കോൺട്രാക്ടർമാർ, വീടുടമകൾ.',
      'bn-IN': 'রাজমিস্ত্রি, সিভিল ঠিকাদার, বাড়ির মালিক।',
      'or-IN': 'କୋଠା ମିସ୍ତ୍ରୀ, ସିଭିଲ୍ ଠିକାଦାର, ଘର ମାଲିକ |'
    },
    howToFill: {
      'en-IN': '1. Enter Wall Dimensions: Length and Height in Feet/Meters. 2. Select Wall Thickness (9-inch or 4.5-inch). 3. Select Brick/Block Type (Red Brick, AAC Block, Solid Concrete Block). 4. Enter Door & Window Deductions. 5. View exact total brick count and mortar cement bags.',
      'hi-IN': '1. दीवार के आयाम दर्ज करें: लंबाई और ऊंचाई। 2. दीवार की मोटाई (9 इंच या 4.5 इंच) चुनें। 3. ईंट का प्रकार चुनें। 4. दरवाजे और खिड़की की कटौती दर्ज करें। 5. ईंटों की कुल संख्या देखें।',
      'kn-IN': '1. ಗೋಡೆ ಅಳತೆಗಳನ್ನು ನಮೂದಿಸಿ: ಉದ್ದ ಮತ್ತು ಎತ್ತರ. 2. ಗೋಡೆ ದಪ್ಪ (9-ಇಂಚು ಅಥವಾ 4.5-ಇಂಚು) ಆಯ್ಕೆಮಾಡಿ. 3. ಇಟ್ಟಿಗೆ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ. 4. ಬಾಗಿಲು ಮತ್ತು ಕಿಟಕಿ ಕಡಿತಗಳನ್ನು ನಮೂದಿಸಿ. 5. ಒಟ್ಟು ಇಟ್ಟಿಗೆಗಳ ಸಂಖ್ಯೆಯನ್ನು ವೀಕ್ಷಿಸಿ.',
      'te-IN': '1. గోడ కొలతలు నమోదు చేయండి: పొడవు మరియు ఎత్తు. 2. గోడ మందం (9-అంగుళాలు లేదా 4.5-అంగుళాలు) ఎంచుకోండి. 3. ఇటుక రకం ఎంచుకోండి. 4. తలుపు మరియు కిటికీ కోతలు నమోదు చేయండి. 5. ఇటుకల సంఖ్య చూడండి.',
      'ta-IN': '1. சுவர் அளவுகளை உள்ளிடவும்: நீளம் மற்றும் உயரம். 2. சுவர் தடிமன் தேர்ந்தெடுக்கவும். 3. வகை தேர்ந்தெடுக்கவும். 4. கதவு மற்றும் சன்னல் கழிவு உள்ளிடவும். 5. மொத்த எண்ணிக்கை பார்க்கவும்.',
      'ml-IN': '1. അളവുകൾ നൽകുക: നീളവും ഉയരവും. 2. കനം തിരഞ്ഞെടുക്കുക. 3. ടൈപ്പ് തിരഞ്ഞെടുക്കുക. 4. ജനൽ-വാതിൽ കുറവ് നൽകുക. 5. ആകെ എണ്ണം കാണുക.',
      'bn-IN': '১. দেয়ালের পরিমাপ দিন: দৈর্ঘ্য ও উচ্চতা। ২. দেয়ালের পুরুত্ব চয়ন করুন। ৩. ইটের ধরন চয়ন করুন। ৪. দরজা-জানালা বাদ দিন। ৫. ইটের সংখ্যা দেখুন।',
      'or-IN': '୧. କାନ୍ଥ ପରିମାଣ ଦିଅନ୍ତୁ: ଲମ୍ବ ଏବଂ ଉଚ୍ଚତା | ୨. କାନ୍ଥ ମୋଟେଇ ବାଛନ୍ତୁ | ୩. ଇଟା ପ୍ରକାର ବାଛନ୍ତୁ | ୪. କବାଟ-ଝରକା କଟା ଦିଅନ୍ତୁ | ୫. ଇଟା ସଂଖ୍ୟା ଦେଖନ୍ତୁ |'
    },
    benefits: {
      'en-IN': '💡 Zero brick breakage loss | Accurate mortar ratio | Automatic door/window deduction.',
      'hi-IN': '💡 शून्य ईंट टूट-फूट का नुकसान | सटीक मसाला अनुपात | स्वचालित कटौती।',
      'kn-IN': '💡 ಇಟ್ಟಿಗೆ ಹಾನಿ ನಷ್ಟವಿಲ್ಲ | ನಿಖರ ಸಿಮೆಂಟ್ ಪ್ರಮಾಣ | ಸ್ವಯಂಚಾಲಿತ ಬಾಗಿಲು ಕಡಿತ.',
      'te-IN': '💡 ఇటుక నష్టం లేదు | ఖచ్చితమైన మిశ్రమం | స్వయంచాలక తలుపు కోత.',
      'ta-IN': '💡 செங்கல் சேதம் இல்லை | துல்லியமான கலவை | தானியங்கி சன்னல் கழிவு.',
      'ml-IN': '💡 ഇഷ്ടിക പാഴാകില്ല | കൃത്യമായ സിമന്റ് അനുപാതം | ജനൽ-വാതിൽ കുറവ്.',
      'bn-IN': '💡 শূন্য ইট ভাঙার ক্ষতি | সঠিক মসলা অনুপাত | দরজা-জানালা স্বয়ংক্রিয় বাদ।',
      'or-IN': '💡 ଶୂନ୍ୟ ଇଟା ଭଙ୍ଗା କ୍ଷତି | ସଠିକ୍ ମସଲା ଅନୁପାତ | ସ୍ୱୟଂଚାଳିତ କଟା |'
    }
  },
  {
    id: 'boq',
    title: 'BOQ Civil Cost Estimator',
    icon: '📋',
    path: '/boq-civil',
    why: {
      'en-IN': 'Generates enterprise-grade Bill of Quantities (BOQ) covering Excavation, Foundation, Structural RCC, Masonry, Plastering & Finishing with Admin Master Rates.',
      'hi-IN': 'खुदाई, नींव, आरसीसी, चिनाई और पलस्तर को कवर करने वाला बीओक्यू तैयार करता है।',
      'kn-IN': 'ಅಗೆಯುವಿಕೆ, ಫೌಂಡೇಶನ್, ಸ್ಟೀಲ್, ಕಾಂಕ್ರೀಟ್, ಪ್ಲಾಸ್ಟರಿಂಗ್ ಸೇರಿ ಸಂಪೂರ್ಣ BOQ ತಯಾರಿಸುತ್ತದೆ.',
      'te-IN': 'తవ్వకం, ఫౌండేషన్, స్టీల్, కాంక్రీట్, ప్లాస్టరింగ్ సహా పూర్తి BOQ తయారు చేస్తుంది.',
      'ta-IN': 'தோண்டுதல், அடித்தளம், கம்பிகள், பூச்சு உள்ளிட்ட முழுமையான BOQ தயாரிக்கிறது.',
      'ml-IN': 'മണ്ണെടുപ്പ്, ഫൗണ്ടേഷൻ, കമ്പി, കോൺക്രീറ്റ് അടക്കം സമ്പൂർണ്ണ BOQ ഉണ്ടാക്കുന്നു.',
      'bn-IN': 'খনন, ভিত্তি, আরসিসি, গাঁথুনি এবং প্লাস্টারিং কভার করে বিওকিউ তৈরি করে।',
      'or-IN': 'ମାଟି ଖୋଳା, ଫାଉଣ୍ଡେସନ୍, RCC, ଗାନ୍ଥେଣି ଏବଂ ପ୍ଲାଷ୍ଟରିଂ ପାଇଁ BOQ ପ୍ରସ୍ତୁତ କରେ |'
    },
    where: {
      'en-IN': 'Used for New Residential Building Projects, Commercial Complexes, Villas, and Renovations.',
      'hi-IN': 'नए आवासीय भवन परियोजनाओं, वाणिज्यिक परिसरों, विला और नवीनीकरण के लिए।',
      'kn-IN': 'ಹೊಸ ವಸತಿ ಯೋಜನೆಗಳು, ವಾಣಿಜ್ಯ ಕಟ್ಟಡಗಳು, ವಿಲ್ಲಾಗಳು ಮತ್ತು ನವೀಕರಣಕ್ಕೆ.',
      'te-IN': 'కొత్త నివాస ప్రాజెక్టులు, వాణిజ్య భవనాలు, విల్లాలు మరియు పునరుద్ధరణలకు.',
      'ta-IN': 'புதிய குடியிருப்பு திட்டங்கள், வணிக கட்டிடங்கள் மற்றும் புதுப்பிப்புகளுக்கு.',
      'ml-IN': 'പുതിയ വീടുകൾ, വാണിജ്യ കെട്ടിടങ്ങൾ, വില്ലകൾ എന്നിവയ്ക്ക്.',
      'bn-IN': 'নতুন আবাসিক প্রকল্প, বাণিজ্যিক ভবন, ভিলা এবং সংস্কারের জন্য।',
      'or-IN': 'ନୂଆ ଘର ନିର୍ମାଣ, ବାଣିଜ୍ୟିକ କୋଠା, ଭିଲ୍ଲା ଏବଂ ମରାମତି ପାଇଁ |'
    },
    when: {
      'en-IN': 'At project inception, before signing client agreements, before bank loan sanctioning.',
      'hi-IN': 'परियोजना की शुरुआत में, ग्राहक समझौते पर हस्ताक्षर करने से पहले, बैंक ऋण से पहले।',
      'kn-IN': 'ಯೋಜನೆಯ ಆರಂಭದಲ್ಲಿ, ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಮಾಡುವ ಮುನ್ನ, ಬ್ಯಾಂಕ್ ಸಾಲಕ್ಕೆ ಮುನ್ನ.',
      'te-IN': 'ప్రాజెక్ట్ ప్రారంభంలో, ఒప్పందంపై సంతకం చేయడానికి ముందు, బ్యాంక్ రుణం కోసం.',
      'ta-IN': 'திட்ட தொடக்கத்தில், ஒப்பந்தத்தில் கையெழுத்திடுவதற்கு முன், வங்கி கடனுக்கு முன்.',
      'ml-IN': 'പ്രോജക്റ്റ് തുടക്കത്തിൽ, കരാർ ഒപ്പിടുന്നതിന് മുമ്പ്, ബാങ്ക് വായ്പയ്ക്ക്.',
      'bn-IN': 'প্রকল্পের শুরুতে, চুক্তিতে সই করার আগে, ব্যাংক লোনের জন্য।',
      'or-IN': 'ପ୍ରକଳ୍ପ ଆରମ୍ଭରେ, ଚୁକ୍ତି ସ୍ୱାକ୍ଷର ପୂର୍ବରୁ, ବ୍ୟାଙ୍କ ଋଣ ପାଇଁ |'
    },
    whom: {
      'en-IN': 'Building Contractors, Quantity Surveyors, Architects, Home Buyers, Bank Valuers.',
      'hi-IN': 'भवन ठेकेदार, मात्रा सर्वेक्षक, वास्तुकार, गृह खरीदार, बैंक मूल्यांकक।',
      'kn-IN': 'ಕಟ್ಟಡ ಗುತ್ತಿಗೆದಾರರು, ಪರಿಮಾಣ ಸರ್ವೇಯರ್‌ಗಳು, ವಾಸ್ತುಶಿಲ್ಪಿಗಳು, ಮನೆ ಖರೀದಿದಾರರು.',
      'te-IN': 'భవన కాంట్రాక్టర్లు, సర్వేయర్లు, ఆర్కిటెక్ట్లు, ఇంటి కొనుగోలుదారులు.',
      'ta-IN': 'கட்டிட ஒப்பந்ததாரர்கள், அளவையாளர்கள், கட்டிடக் கலைஞர்கள், வீட்டு உரிமையாளர்கள்.',
      'ml-IN': 'കോൺട്രാക്ടർമാർ, സർവേയർമാർ, ആർക്കിടെക്റ്റുകൾ, വീടുടമകൾ.',
      'bn-IN': 'বিল্ডিং ঠিকাদার, সার্ভেয়ার, আর্কিটেক্ট, বাড়ির ক্রেতা।',
      'or-IN': 'କୋଠା ଠିକାଦାର, ସର୍ଭେୟାର, ଆର୍କିଟେକ୍ଟ, ଘର କ୍ରେତା |'
    },
    howToFill: {
      'en-IN': '1. Enter Total Built-Up Area in Sq.Ft. 2. Select Number of Floors (G+1, G+2, etc.). 3. Select Quality Grade (Standard, Premium, Luxury). 4. Auto-Generate Itemized BOQ across Substructure, RCC Structure, Masonry & Finishing. 5. Download Bank-Ready PDF Estimation.',
      'hi-IN': '1. निर्मित क्षेत्र दर्ज करें। 2. मंजिलों की संख्या चुनें। 3. गुणवत्ता श्रेणी (मानक, प्रीमियम) चुनें। 4. बीओक्यू जनरेट करें। 5. पीडीएफ डाउनलोड करें।',
      'kn-IN': '1. ಒಟ್ಟು ನಿರ್ಮಿತ ಪ್ರದೇಶವನ್ನು ನಮೂದಿಸಿ (Sq.Ft). 2. ಮಹಡಿಗಳ ಸಂಖ್ಯೆ ಆಯ್ಕೆಮಾಡಿ (G+1, G+2). 3. ಗುಣಮಟ್ಟ ಶ್ರೇಣಿ ಆಯ್ಕೆಮಾಡಿ. 4. BOQ ಪಡೆಯಿರಿ. 5. PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.',
      'te-IN': '1. నిర్మిత ప్రాంతం నమోదు చేయండి (Sq.Ft). 2. అంతస్తులు ఎంచుకోండి (G+1, G+2). 3. నాణ్యత శ్రేణి ఎంచుకోండి. 4. BOQ పొందండి. 5. PDF డౌన్‌లోడ్ చేయండి.',
      'ta-IN': '1. பரப்பளவு உள்ளிடவும். 2. தளங்கள் தேர்ந்தெடுக்கவும். 3. தரம் தேர்ந்தெடுக்கவும். 4. BOQ பெறவும். 5. PDF பதிவிறக்கவும்.',
      'ml-IN': '1. വിസ്തീർണ്ണം നൽകുക. 2. നിലകൾ തിരഞ്ഞെടുക്കുക. 3. ക്വാളിറ്റി തിരഞ്ഞെടുക്കുക. 4. BOQ ഡൗൺലോഡ് ചെയ്യുക.',
      'bn-IN': '১. মোট এলাকা দিন। ২. তলার সংখ্যা চয়ন করুন। ৩. কোয়ালিটি চয়ন করুন। ৪. বিওকিউ ডাউনলোড করুন।',
      'or-IN': '୧. ଏରିଆ ଦିଅନ୍ତୁ | ୨. ଫ୍ଲୋର୍ ସଂଖ୍ୟା ବାଛନ୍ତୁ | ୩. ଗୁଣବତ୍ତା ବାଛନ୍ତୁ | ୪. BOQ ଡାଉନଲୋଡ୍ କରନ୍ତୁ |'
    },
    benefits: {
      'en-IN': '⚡ Instant Bank-ready BOQ report | Admin Master Approved Rates | Eliminates budget overrun risk.',
      'hi-IN': '⚡ तत्काल बैंक-तैयार बीओक्यू रिपोर्ट | एडमिन स्वीकृत दरें | बजट से अधिक जोखिम समाप्त।',
      'kn-IN': '⚡ ತಕ್ಷಣದ ಬ್ಯಾಂಕ್ ಸಾಲದ BOQ ವರದಿ | ಲೈವ್ ದರಗಳು | ಬಜೆಟ್ ಮಿತಿಮೀರುವ ಅಪಾಯವಿಲ್ಲ.',
      'te-IN': '⚡ తక్షణ బ్యాంక్ రుణం BOQ నివేదిక | లైవ్ ధరలు | బడ్జెట్ దాటే ప్రమాదం లేదు.',
      'ta-IN': '⚡ உடனடி வங்கி கடன் BOQ அறிக்கை | நேரலை விலைகள் | வரவுசெலவு தாண்டும் அபாயமில்லை.',
      'ml-IN': '⚡ തൽക്ഷണ ബാങ്ക് വായ്പ BOQ റിപ്പോർട്ട് | ലൈവ് നിരക്കുകൾ | ബജറ്റ് തെറ്റില്ല.',
      'bn-IN': '⚡ তাতক্ষণিক ব্যাংক-রেডি বিওকিউ রিপোর্ট | এডমিন অনুমোদিত দর | বাজেট ওভাররান ঝুঁকি শূন্য।',
      'or-IN': '⚡ ତୁରନ୍ତ ବ୍ୟାଙ୍କ ଋଣ BOQ ରିପୋର୍ଟ | ଲାଇଭ୍ ଦର | ବଜେଟ୍ ନଷ୍ଟ ହେବ ନାହିଁ |'
    }
  }
];

export default function BuildMitraAppGuide() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isOpen, setIsOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState('steel');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNarrating, setIsNarrating] = useState(false);

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const getPreferredVoice = (lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = lang.split("-")[0];

    let voice = voices.find(v => (v.lang === lang || v.lang.startsWith(langPrefix)) && (
      v.name.includes("Female") || v.name.includes("Ananya") || v.name.includes("Heera") || v.name.includes("Neerja") || v.name.includes("Swara") || v.name.includes("Google")
    ));

    if (!voice) {
      voice = voices.find(v => v.lang === lang || v.lang.startsWith(langPrefix));
    }

    if (!voice) {
      voice = voices.find(v => v.lang.includes("IN") && (v.name.includes("Female") || v.name.includes("Google") || v.name.includes("India")));
    }

    return voice || voices[0];
  };

  const playFullVoiceNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    window.speechSynthesis.cancel();

    const currentGuide = APP_GUIDES.find(g => g.id === activeModuleId) || APP_GUIDES[0];
    const introText = GENERAL_APP_OVERVIEW[selectedLang] || GENERAL_APP_OVERVIEW['en-IN'];
    
    const whyText = currentGuide.why[selectedLang] || currentGuide.why['en-IN'];
    const howText = currentGuide.howToFill[selectedLang] || currentGuide.howToFill['en-IN'];

    const fullSpeechText = `${introText}. ${currentGuide.title}: ${whyText}. ${howText}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.lang = selectedLang;
    utterance.rate = 0.90;

    const voice = getPreferredVoice(selectedLang);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsNarrating(true);
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceNarration = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsNarrating(false);
  };

  const filteredGuides = APP_GUIDES.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGuide = APP_GUIDES.find(g => g.id === activeModuleId) || APP_GUIDES[0];

  return (
    <>
      {/* PERSISTENT TOP APP GUIDE BANNER BUTTON WITH HIGHLIGHTED VOICE NARRATION BOX */}
      <div style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '8px 14px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        borderBottom: '3px solid #0284c7',
        zIndex: 999,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ background: '#0284c7', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', color: '#ffffff', fontWeight: '800' }}>
            💡 BUILDMITRA USER GUIDE
          </span>
          <span>How to Use, Where, When, Whom &amp; How across 8 Languages</span>
        </div>

        {/* HIGHLIGHTED VOICE AUDIO NARRATION BOX */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0369a1 100%)',
            border: '2px solid #38bdf8',
            borderRadius: '10px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
          }}>
            <select
              value={selectedLang}
              onChange={(e) => { setSelectedLang(e.target.value); stopVoiceNarration(); }}
              style={{
                backgroundColor: '#0f172a',
                color: '#38bdf8',
                border: '1px solid #38bdf8',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>
              ))}
            </select>

            <button
              onClick={playFullVoiceNarration}
              style={{
                backgroundColor: isNarrating ? '#ef4444' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(22,163,74,0.4)'
              }}
            >
              {isNarrating ? '⏹️ Stop Narration' : `🔊 Play Full Voice Narration (${activeLang.nativeName})`}
            </button>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            📖 Open App Guide
          </button>
        </div>
      </div>

      {/* FULL SLIDE-OVER / MODAL APPLICATION GUIDE */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1100px',
            maxHeight: '92vh',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
          }}>
            {/* MODAL HEADER */}
            <div style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              borderBottom: '3px solid #0284c7',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800', textTransform: 'uppercase' }}>
                  BuildMitra Construction Suite — On-Screen &amp; Voice Audio Guide
                </div>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📖 Module Guide ({activeLang.nativeName})
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={playFullVoiceNarration}
                  style={{
                    backgroundColor: isNarrating ? '#ef4444' : '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isNarrating ? '⏹️ Stop Narration' : `🔊 Speak Out Narrations (${activeLang.nativeName})`}
                </button>

                <button
                  onClick={() => { stopVoiceNarration(); setIsOpen(false); }}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    width: '34px',
                    height: '34px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* MODAL BODY CONTENT */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexWrap: 'wrap' }}>
              {/* LEFT SIDEBAR: MODULE SELECTOR */}
              <div style={{
                width: '300px',
                borderRight: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                padding: '12px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <input
                  type="text"
                  placeholder="🔍 Search Module / Tab..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    marginBottom: '8px'
                  }}
                />

                {filteredGuides.map(guide => (
                  <button
                    key={guide.id}
                    onClick={() => { setActiveModuleId(guide.id); stopVoiceNarration(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: activeModuleId === guide.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: activeModuleId === guide.id ? '#f0f9ff' : '#ffffff',
                      color: activeModuleId === guide.id ? '#0284c7' : '#334155',
                      fontWeight: activeModuleId === guide.id ? '800' : '600',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: '0.15s'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{guide.icon}</span>
                    <span>{guide.title}</span>
                  </button>
                ))}
              </div>

              {/* RIGHT CONTENT AREA: 5-W's & HOW TO FILL USER FIELDS */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#ffffff', minWidth: '300px' }}>
                
                {/* GENERAL APP OVERVIEW CARD */}
                <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 16px', borderRadius: '12px', marginBottom: '16px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', textTransform: 'uppercase' }}>🏢 General BuildMitra Suite Description ({activeLang.nativeName})</div>
                  <div style={{ fontSize: '13px', color: '#f1f5f9', marginTop: '6px', lineHeight: '1.5' }}>
                    {GENERAL_APP_OVERVIEW[selectedLang] || GENERAL_APP_OVERVIEW['en-IN']}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{activeGuide.icon}</span> {activeGuide.title}
                  </h3>
                  <button
                    onClick={() => { stopVoiceNarration(); setIsOpen(false); router.push(activeGuide.path); }}
                    style={{
                      backgroundColor: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Open Calculator Page →
                  </button>
                </div>

                {/* HYPE & BENEFITS BANNER */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}>
                  {activeGuide.benefits[selectedLang] || activeGuide.benefits['en-IN']}
                </div>

                {/* 5-W's NARRATIVE CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0284c7', textTransform: 'uppercase' }}>🎯 Why to Use? (Purpose)</div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '600' }}>
                      {activeGuide.why[selectedLang] || activeGuide.why['en-IN']}
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f766e', textTransform: 'uppercase' }}>📍 Where to Use? (Phase)</div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '600' }}>
                      {activeGuide.where[selectedLang] || activeGuide.where['en-IN']}
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#b45309', textTransform: 'uppercase' }}>⏰ When to Use? (Stage)</div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '600' }}>
                      {activeGuide.when[selectedLang] || activeGuide.when['en-IN']}
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#6d28d9', textTransform: 'uppercase' }}>👤 Whom is it For? (Target)</div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '600' }}>
                      {activeGuide.whom[selectedLang] || activeGuide.whom['en-IN']}
                    </div>
                  </div>
                </div>

                {/* HOW TO FILL USER INPUT FIELDS (TEXT & VOICE NARRATED) */}
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '2px solid #0284c7' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✍️ How to Fill User Input Fields ({activeLang.nativeName}):
                  </div>
                  <div style={{ fontSize: '13px', color: '#0f172a', marginTop: '6px', fontWeight: '600', lineHeight: '1.6' }}>
                    {activeGuide.howToFill[selectedLang] || activeGuide.howToFill['en-IN']}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
