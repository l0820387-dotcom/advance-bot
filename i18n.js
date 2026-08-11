/**
 * Multi-Language Centralized Translation Architecture (English & Hindi)
 */
const dictionary = {
  en: {
    welcome: "🤖 <b>PREMIUM DEVELOPER HUB</b>\n\nWelcome, <b>{name}</b>!\nYour all-in-one Telegram developer utility platform.\n\nChoose a module below to start:",
    main_menu: "🏠 <b>Main Menu</b>\nSelect a tool category or manage your account:",
    admin_welcome: "👑 <b>ADMINISTRATOR CONTROL PANEL</b>\n\nSystem Status: <code>ONLINE</code>\nSelect an administrative function:",
    access_denied: "❌ <b>Access Denied.</b> You do not have administrator permissions.",
    insufficient_credits: "❌ <b>Insufficient Credits!</b>\nRequired: {required} credits\nYour Balance: {current} credits.\n\nGet credits via Referral or Upgrade to Premium!",
    maintenance_active: "🔧 <b>Maintenance Mode</b>\nThe bot is currently undergoing scheduled maintenance. Please check back later.",
    tool_disabled: "⚠️ This tool is currently disabled by the administrator.",
    processing: "⏳ <b>Processing Request...</b>\nPlease wait while your request is processed.",
    btn_back: "⬅️ Back",
    btn_home: "🏠 Home",
    btn_cancel: "❌ Cancel",
    cancel_success: "✅ Operation cancelled."
  },
  hi: {
    welcome: "🤖 <b>प्रीमियम डेवलपर हब</b>\n\nस्वागत है, <b>{name}</b>!\nआपका ऑल-इन-वन टेलीग्राम डेवलपर यूटिलिटी प्लेटफॉर्म।\n\nशुरू करने के लिए एक श्रेणी चुनें:",
    main_menu: "🏠 <b>मुख्य मेनू</b>\nकोई टूल या अपना खाता चुनें:",
    admin_welcome: "👑 <b>एडमिनिस्ट्रेटर कंट्रोल पैनल</b>\n\nसिस्टम स्थिति: <code>ऑनलाइन</code>\nप्रशासनिक कार्य चुनें:",
    access_denied: "❌ <b>एक्सेस अस्वीकृत।</b> आपके पास एडमिन अधिकार नहीं हैं।",
    insufficient_credits: "❌ <b>अपर्याप्त क्रेडिट!</b>\nआवश्यक: {required} क्रेडिट\nआपका शेष: {current} क्रेडिट।",
    maintenance_active: "🔧 <b>रखरखाव मोड</b>\nबॉट में वर्तमान में रखरखाव चल रहा है। कृपया बाद में प्रयास करें।",
    tool_disabled: "⚠️ यह टूल व्यवस्थापक द्वारा अक्षम किया गया है।",
    processing: "⏳ <b>प्रोसेसिंग जारी है...</b>\nकृपया प्रतीक्षा करें।",
    btn_back: "⬅️ वापस",
    btn_home: "🏠 होम",
    btn_cancel: "❌ रद्द करें",
    cancel_success: "✅ कार्रवाई रद्द कर दी गई।"
  }
};

function t(lang, key, params = {}) {
  const language = dictionary[lang] ? lang : 'en';
  let text = dictionary[language][key] || dictionary['en'][key] || key;
  for (const [pKey, pVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
  }
  return text;
}

module.exports = { t };
