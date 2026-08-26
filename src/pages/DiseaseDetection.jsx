import React, { useState, useEffect } from 'react';
import {
  ScanLine,
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Info,
  Droplets,
  ShieldAlert,
  History,
  AlertCircle,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Leaf,
  FileText
} from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Multilingual Dictionary for Crop & Pathology translations
const CROP_TRANSLATIONS = {
  rice: {
    en: 'Rice / Paddy',
    te: 'వరి (Paddy / Rice)',
    hi: 'धान / चावल (Paddy / Rice)'
  },
  tomato: {
    en: 'Tomato',
    te: 'టమాటా (Tomato)',
    hi: 'टमाटर (Tomato)'
  },
  chilli: {
    en: 'Chilli',
    te: 'మిరప (Chilli)',
    hi: 'मिर्च (Chilli)'
  },
  cotton: {
    en: 'Cotton',
    te: 'పత్తి (Cotton)',
    hi: 'कपास (Cotton)'
  },
  maize: {
    en: 'Maize / Corn',
    te: 'మొక్కజొన్న (Maize)',
    hi: 'मक्का (Maize)'
  },
  groundnut: {
    en: 'Groundnut / Peanut',
    te: 'వేరుశనగ (Groundnut)',
    hi: 'मूंगफली (Groundnut)'
  },
  potato: {
    en: 'Potato',
    te: 'బంగాళాదుంప (Potato)',
    hi: 'आलू (Potato)'
  },
  brinjal: {
    en: 'Brinjal / Eggplant',
    te: 'వంకాయ (Brinjal)',
    hi: 'बैंगन (Brinjal)'
  },
  onion: {
    en: 'Onion',
    te: 'ఉల్లిపాయ (Onion)',
    hi: 'प्याज (Onion)'
  },
  banana: {
    en: 'Banana',
    te: 'అరటి (Banana)',
    hi: 'केला (Banana)'
  },
  sugarcane: {
    en: 'Sugarcane',
    te: 'చెరకు (Sugarcane)',
    hi: 'गन्ना (Sugarcane)'
  },
  mango: {
    en: 'Mango',
    te: 'మామిడి (Mango)',
    hi: 'आम (Mango)'
  }
};

const DISEASE_TRANSLATIONS = {
  'bacterial leaf blight': {
    en: 'Bacterial Leaf Blight',
    te: 'బ్యాక్టీరియల్ లీఫ్ బ్లైట్ (ఎండు తెగులు)',
    hi: 'बैक्टीरियल लीफ ब्लाइट (जीवाणु झुलसा)'
  },
  'rice blast': {
    en: 'Rice Blast',
    te: 'వరి అగ్గితెగులు (Rice Blast)',
    hi: 'धान का झुलसा रोग (Rice Blast)'
  },
  'brown spot': {
    en: 'Brown Spot',
    te: 'గోధుమ మచ్చ తెగులు (Brown Spot)',
    hi: 'भूरा धब्बा रोग (Brown Spot)'
  },
  'sheath blight': {
    en: 'Sheath Blight',
    te: 'కాండం కుళ్ళు తెగులు (Sheath Blight)',
    hi: 'शीथ ब्लाइट रोग'
  },
  'early blight': {
    en: 'Early Blight',
    te: 'ముందస్తు ఆకుమచ్చ తెగులు (Early Blight)',
    hi: 'अगेती झुलसा रोग (Early Blight)'
  },
  'late blight': {
    en: 'Late Blight',
    te: 'లేట్ బ్లైట్ తెగులు (Late Blight)',
    hi: 'पछेती झुलसा रोग (Late Blight)'
  },
  'anthracnose': {
    en: 'Anthracnose / Fruit Rot',
    te: 'కొమ్మ ఎండు / కాయకుళ్ళు తెగులు (Anthracnose)',
    hi: 'एंथ्रेक्नोज / फल सड़न रोग'
  },
  'leaf curl': {
    en: 'Leaf Curl Virus',
    te: 'ఆకుముడుత వైరస్ తెగులు (Leaf Curl)',
    hi: 'पत्ती मरोड़ विषाणु (Leaf Curl)'
  },
  'bacterial blight': {
    en: 'Bacterial Blight / Angular Leaf Spot',
    te: 'బాక్టీరియా ఆకుమచ్చ తెగులు',
    hi: 'जीवाणु झुलसा रोग'
  },
  'northern corn leaf blight': {
    en: 'Northern Corn Leaf Blight',
    te: 'మొక్కజొన్న ఆకు ఎండు తెగులు',
    hi: 'मक्का पत्ती झुलसा रोग'
  },
  'tikka': {
    en: 'Tikka / Late Leaf Spot',
    te: 'తిక్కా ఆకుమచ్చ తెగులు (Tikka)',
    hi: 'टिक्का रोग (Tikka Disease)'
  },
  'purple blotch': {
    en: 'Purple Blotch',
    te: 'ఊదా రంగు మచ్చల తెగులు (Purple Blotch)',
    hi: 'बैंगनी धब्बा रोग (Purple Blotch)'
  },
  'sigatoka': {
    en: 'Sigatoka Leaf Spot',
    te: 'సిగటోకా ఆకుమచ్చ తెగులు (Sigatoka)',
    hi: 'सिगाटोका पत्ती धब्बा रोग'
  },
  'red rot': {
    en: 'Red Rot',
    te: 'ఎరుపు కుళ్ళు తెగులు (Red Rot)',
    hi: 'लाल सड़न रोग (Red Rot)'
  }
};

export default function DiseaseDetection({ isLoggedIn = false }) {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [pendingResult, setPendingResult] = useState(null);  // holds result until 100%
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const data = await api.disease.getHistory();
      setScanHistory(data || []);
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  const handleAnalyze = async (file) => {
    const targetFile = file || selectedFile;
    if (!targetFile) return;

    // Reset state
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setPendingResult(null);
    setError(null);
    setResult(null);

    // ── Progress timer: increments quickly at first, then slows near 99% ──
    // Total simulated duration ~8s. API usually takes 3-10s.
    let current = 0;
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        // Ease curve: fast 0→70, slow 70→90, crawl 90→99
        let increment;
        if (prev < 70)      increment = 1.8;
        else if (prev < 88) increment = 0.6;
        else if (prev < 99) increment = 0.15;
        else                increment = 0;   // hold at 99 until API responds
        const next = Math.min(prev + increment, 99);
        current = next;
        return next;
      });
    }, 120);

    try {
      const formData = new FormData();
      formData.append('image', targetFile);
      formData.append('language', language);

      const res = await api.disease.analyze(formData);

      // API responded — stop the interval
      clearInterval(progressInterval);

      if (res.status === 'invalid_image') {
        setError(t('invalid_image_msg') || res.message);
        setAnalysisProgress(0);
        setIsAnalyzing(false);
        return;
      }
      if (res.status === 'insufficient_image') {
        setError(t('insufficient_image_msg') || res.message);
        setAnalysisProgress(0);
        setIsAnalyzing(false);
        return;
      }

      // Push bar to 100% smoothly, then reveal result after a short pause
      setPendingResult(res);
      setAnalysisProgress(100);

      // Wait 700ms so user sees the 100% state, then show result
      setTimeout(() => {
        setResult(res);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        fetchHistory();
      }, 700);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('Analysis failed:', err);
      setError('AI Leaf Analysis failed. Please verify backend connectivity.');
      setAnalysisProgress(0);
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      handleAnalyze(file);
    }
  };

  // Helper to translate crop name based on active language
  const getLocalizedCrop = (cropData) => {
    const rawName = typeof cropData === 'object' ? cropData?.name : cropData;
    if (!rawName) return t('crop_label');
    const lower = rawName.toLowerCase();
    for (const [key, val] of Object.entries(CROP_TRANSLATIONS)) {
      if (lower.includes(key)) {
        return val[language] || val.en || rawName;
      }
    }
    return rawName;
  };

  // Helper to translate disease name based on active language
  const getLocalizedDisease = (diseaseData) => {
    const rawName = typeof diseaseData === 'object' ? diseaseData?.name : diseaseData;
    if (!rawName) return t('disease_label');
    const lower = rawName.toLowerCase();
    for (const [key, val] of Object.entries(DISEASE_TRANSLATIONS)) {
      if (lower.includes(key)) {
        return val[language] || val.en || rawName;
      }
    }
    return rawName;
  };

  // Helper for Severity display
  const getLocalizedSeverity = (sev) => {
    const s = (typeof sev === 'object' ? sev?.level : sev || 'moderate').toLowerCase();
    if (s.includes('mild')) return t('severity_mild');
    if (s.includes('severe')) return t('severity_severe');
    if (s.includes('unknown') || s.includes('none')) return t('severity_unknown');
    return t('severity_moderate');
  };

  // Helper for Confidence Badge
  const getConfidenceBadge = (res) => {
    const isFallback = res.source === 'reference_knowledge_base' || res.status === 'fallback';
    if (isFallback) {
      return (
        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-300 shadow-2xs flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-amber-700" />
          {t('reference_guidance_badge')}
        </span>
      );
    }

    const confLevel = res.confidence?.level || 'high';
    let label = t('ai_confidence_high');
    let colorClass = 'bg-green-100 text-green-800 border-green-300';

    if (confLevel === 'medium') {
      label = t('ai_confidence_medium');
      colorClass = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (confLevel === 'low') {
      label = t('ai_confidence_low');
      colorClass = 'bg-amber-100 text-amber-800 border-amber-300';
    }

    return (
      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border shadow-2xs flex items-center gap-1 ${colorClass}`}>
        <Sparkles className="w-3.5 h-3.5" />
        {label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-green-600" />
          {t('disease_badge')}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          {t('disease_title')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('disease_desc')}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 text-sm max-w-2xl mx-auto shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Disease Diagnostic Studio */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Upload Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-green-600" />
            {t('upload_box_title')}
          </h2>

          <label
            htmlFor="crop-photo-upload"
            className="border-2 border-dashed border-gray-200 hover:border-green-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50/50 hover:bg-green-50/40 transition-all text-center min-h-[280px]"
          >
            {selectedImage ? (
              <div className="relative text-center">
                <img
                  src={selectedImage}
                  alt="Uploaded leaf"
                  className="w-48 h-48 object-cover rounded-2xl border-2 border-green-600 shadow-md mx-auto"
                />
                <p className="text-xs text-green-700 font-semibold mt-3 flex items-center justify-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t('change_image')}
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center shadow-inner">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {t('upload_click')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t('upload_hint')}</p>
                </div>
              </>
            )}
            <input
              id="crop-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          {/* Supported Crops Tag Pills */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              Supported Indian Crops:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-600">
              {['Rice / Paddy', 'Tomato', 'Chilli', 'Cotton', 'Maize', 'Groundnut', 'Potato', 'Brinjal', 'Onion', 'Banana', 'Sugarcane', 'Mango'].map((c) => (
                <span key={c} className="px-2 py-0.5 bg-gray-100 hover:bg-green-50 rounded-md border border-gray-200">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Diagnosis Results Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-green-600" />
              {t('diag_report_title')}
            </h2>
            {result && getConfidenceBadge(result)}
          </div>

          {isAnalyzing ? (
            <PageLoader
              variant="scan"
              label={t('diag_analyzing')}
              sublabel={t('diag_analyzing_sub')}
              progress={analysisProgress}
            />
          ) : result ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              
              {/* Fallback Reference Alert Notice if Claude was unavailable */}
              {(result.source === 'reference_knowledge_base' || result.status === 'fallback') && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{t('reference_guidance_desc')}</p>
                </div>
              )}

              {/* Main Pathology Header Card */}
              <div className="p-5 bg-red-50/90 rounded-2xl border border-red-100 flex items-start gap-3.5 shadow-2xs">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-red-950 text-lg">
                      {getLocalizedDisease(result.disease)}
                    </h3>
                    {result.disease?.scientific_name && (
                      <span className="text-xs italic text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md font-serif">
                        {result.disease.scientific_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-red-800">
                    <span className="font-semibold">{t('crop_label')}:</span> {getLocalizedCrop(result.crop)}
                    {result.crop?.scientific_name && ` (${result.crop.scientific_name})`} • <span className="font-semibold">Severity:</span> {getLocalizedSeverity(result.severity)}
                  </p>
                </div>
              </div>

              {/* Symptoms Identified */}
              {result.symptoms && result.symptoms.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-600" />
                    {t('symptoms_label')}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                    {result.symptoms.map((sym, idx) => (
                      <li key={idx} className="leading-relaxed">{sym}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Organic Solution */}
              <div className="p-4 bg-green-50/90 rounded-2xl border border-green-100 space-y-1.5 shadow-2xs">
                <h4 className="font-bold text-green-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {t('remedy_organic')}
                </h4>
                <div className="text-xs sm:text-sm text-green-950 leading-relaxed space-y-1">
                  {result.organic_remedy?.recommendations?.map((rec, i) => (
                    <p key={i}>{rec}</p>
                  )) || <p>{result.organicSolution}</p>}
                </div>
              </div>

              {/* Chemical Treatment */}
              <div className="p-4 bg-blue-50/90 rounded-2xl border border-blue-100 space-y-1.5 shadow-2xs">
                <h4 className="font-bold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  {t('remedy_chemical')}
                </h4>
                <div className="text-xs sm:text-sm text-blue-950 leading-relaxed space-y-1">
                  {result.chemical_treatment?.recommendations?.map((rec, i) => (
                    <p key={i}>{rec}</p>
                  )) || <p>{result.chemicalSolution}</p>}
                </div>
                <p className="text-[11px] text-blue-700 italic pt-1">
                  * Always follow the chemical product label and local agricultural extension guidance for safe dilution and safety intervals.
                </p>
              </div>

              {/* Prevention Advice */}
              <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-100 space-y-1.5 shadow-2xs">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-600" />
                  {t('remedy_prevention')}
                </h4>
                <div className="text-xs sm:text-sm text-amber-950 leading-relaxed space-y-1">
                  {Array.isArray(result.prevention) ? (
                    result.prevention.map((prev, i) => <p key={i}>{prev}</p>)
                  ) : (
                    <p>{result.prevention}</p>
                  )}
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 leading-normal flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{t('advisory_disclaimer')}</span>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-gray-400 space-y-2">
              <ScanLine className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
              <p className="text-sm font-medium">{t('diag_empty')}</p>
            </div>
          )}

          {/* Scan History from DB */}
          {scanHistory.length > 0 && (
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-gray-500" />
                {t('recent_scans')}
              </h4>
              <div className="space-y-2">
                {scanHistory.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-2.5 bg-gray-50 hover:bg-gray-100/70 transition-colors rounded-xl flex items-center justify-between text-xs border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-800">{getLocalizedCrop(item.crop_detected)}</span>
                      <span className="text-gray-600"> - {getLocalizedDisease(item.disease_detected)}</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                      item.source === 'reference_knowledge_base' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.source === 'reference_knowledge_base' ? t('source_reference_guidance') : t('source_ai_diagnosis')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
