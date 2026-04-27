"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ur' | 'dr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    home: "Home",
    visa_services: "Visa Services",
    consultancy: "Consultancy",
    tickets: "Tickets",
    exit_permit: "Exit Permit",
    track: "Track Application",
    offices: "Offices",
    apply_now: "Apply Now",
    
    // Sub-links
    tourist_visa: "Tourist Visa",
    business_visa: "Business Visa",
    student_visa: "Student Visa",
    work_visa: "Work Visa",
    medical_visa: "Medical Visa",
    visa_extensions: "Visa Extensions",
    required_documents: "Required Documents",
    visa_fees: "Visa Fees",
    eligibility_checker: "Eligibility Checker",

    // Hero
    hero_badge: "Premium Visa Assistance",
    hero_title: "Expert Guidance for Your Journey",
    hero_subtitle: "We simplify complex immigration rules and provide professional end-to-end support for your e-visa application.",
    explore_categories: "Explore Categories",
    talk_to_expert: "Talk to an Expert",
    
    // Hero Labels (Specific to existing Hero)
    hero_badge_alt: "Your Trusted Visa Partner",
    hero_title_alt: "Explore the World Without Limits",
    hero_subtitle_alt: "Syed Services provides expert guidance for visas, flight tickets, and immigration. We turn your international dreams into reality with 99% success rate.",
    start_application: "Start Your Application",
    consult_whatsapp: "Consult via WhatsApp",
    secure_trusted: "Secure & Trusted",
    global_reach: "Global Reach",
    fast_process: "Fast Process",
    apps_approved: "Applications Approved",

    // Stats
    visas_approved: "Visas Approved",
    success_rate: "Success Rate",
    countries: "Countries",
    years_exp: "Years Experience",
    
    // Services
    our_services: "Our Services",
    visa_desc: "Tourist, business, and study visas for all major countries.",
    ticket_desc: "Best fares for domestic and international flights.",
    consult_desc: "Professional immigration and legal consultancy.",
    
    // Footer
    about_us: "About Us",
    contact: "Contact",
    privacy: "Privacy Policy",
    rights: "All rights reserved.",
  },
  ur: {
    // Navbar
    home: "ہوم",
    visa_services: "ویزہ سروسز",
    consultancy: "کنسلٹنسی",
    tickets: "ٹکٹ",
    exit_permit: "ایگزٹ پرمٹ",
    track: "درخواست ٹریک کریں",
    offices: "دفاتر",
    apply_now: "ابھی اپلائی کریں",

    // Sub-links
    tourist_visa: "سیاحتی ویزہ",
    business_visa: "کاروباری ویزہ",
    student_visa: "سٹوڈنٹ ویزہ",
    work_visa: "ورک ویزہ",
    medical_visa: "میڈیکل ویزہ",
    visa_extensions: "ویزہ توسیع",
    required_documents: "مطلوبہ دستاویزات",
    visa_fees: "ویزہ فیس",
    eligibility_checker: "اہلیت چیکر",
    
    // Hero
    hero_badge: "پریمیم ویزہ امداد",
    hero_title: "آپ کے سفر کے لیے ماہرانہ رہنمائی",
    hero_subtitle: "ہم امیگریشن کے پیچیدہ قوانین کو آسان بناتے ہیں اور آپ کی ای-ویزہ درخواست کے لیے پیشہ ورانہ تعاون فراہم کرتے ہیں۔",
    explore_categories: "اقسام دیکھیں",
    talk_to_expert: "ماہر سے بات کریں",

    // Hero Labels
    hero_badge_alt: "آپ کا بھروسہ مند ویزہ پارٹنر",
    hero_title_alt: "بغیر کسی پابندی کے دنیا کی سیر کریں",
    hero_subtitle_alt: "سید سروسز ویزہ، فلائٹ ٹکٹ اور امیگریشن کے لیے ماہرانہ رہنمائی فراہم کرتی ہے۔ ہم آپ کے بین الاقوامی خوابوں کو 99 فیصد کامیابی کی شرح کے ساتھ حقیقت میں بدلتے ہیں۔",
    start_application: "درخواست شروع کریں",
    consult_whatsapp: "واٹس ایپ پر مشورہ کریں",
    secure_trusted: "محفوظ اور قابل بھروسہ",
    global_reach: "عالمی رسائی",
    fast_process: "تیز رفتار عمل",
    apps_approved: "درخواستیں منظور شدہ",
    
    // Stats
    visas_approved: "ویزے منظور شدہ",
    success_rate: "کامیابی کی شرح",
    countries: "ممالک",
    years_exp: "سال کا تجربہ",
    
    // Services
    our_services: "ہماری خدمات",
    visa_desc: "تمام بڑے ممالک کے لیے سیاحتی، کاروباری اور تعلیمی ویزے۔",
    ticket_desc: "مقامی اور بین الاقوامی پروازوں کے بہترین کرایے۔",
    consult_desc: "پیشہ ورانہ امیگریشن اور قانونی کنسلٹنسی۔",
    
    // Footer
    about_us: "ہمارے بارے میں",
    contact: "رابطہ",
    privacy: "رازداری کی پالیسی",
    rights: "جملہ حقوق محفوظ ہیں۔",
  },
  dr: {
    // Navbar
    home: "صفحه اصلی",
    visa_services: "خدمات ویزا",
    consultancy: "مشاوره",
    tickets: "تکیت",
    exit_permit: "اجازه خروج",
    track: "پیگیری درخواست",
    offices: "دفاتر",
    apply_now: "اکنون درخواست دهید",

    // Sub-links
    tourist_visa: "ویزای توریستی",
    business_visa: "ویزای تجاری",
    student_visa: "ویزای تحصیلی",
    work_visa: "ویزای کار",
    medical_visa: "ویزای صحی",
    visa_extensions: "تمدید ویزا",
    required_documents: "اسناد مورد نیاز",
    visa_fees: "قیمت ویزا",
    eligibility_checker: "بررسی واجد شرایط بودن",
    
    // Hero
    hero_badge: "کمک ویزای ممتاز",
    hero_title: "رهنمایی تخصصی برای سفر شما",
    hero_subtitle: "ما قوانین پیچیده مهاجرت را ساده می‌کنیم و پشتیبانی حرفه‌ای برای درخواست ویزای الکترونیکی شما ارائه می‌دهیم.",
    explore_categories: "بررسی دسته‌ها",
    talk_to_expert: "صحبت با کارشناس",

    // Hero Labels
    hero_badge_alt: "شریک ویزای قابل اعتماد شما",
    hero_title_alt: "جهان را بدون محدودیت کشف کنید",
    hero_subtitle_alt: "سید سرویسز رهنمایی‌های تخصصی برای ویزا، تکت طیاره و مهاجرت ارائه می‌دهد. ما رویاهای بین‌المللی شما را با نرخ موفقیت ۹۹٪ به واقعیت تبدیل می‌کنیم.",
    start_application: "درخواست خود را شروع کنید",
    consult_whatsapp: "مشاوره از طریق واتساپ",
    secure_trusted: "امن و قابل اعتماد",
    global_reach: "دسترسی جهانی",
    fast_process: "پروسه سریع",
    apps_approved: "درخواست‌های تایید شده",
    
    // Stats
    visas_approved: "ویزاهای تایید شده",
    success_rate: "نرخ موفقیت",
    countries: "کشورها",
    years_exp: "سال تجربه",
    
    // Services
    our_services: "خدمات ما",
    visa_desc: "ویزای توریستی، تجاری و تحصیلی برای تمامی کشورهای بزرگ.",
    ticket_desc: "بهترین نرخ‌ها برای پروازهای داخلی و بین‌المللی.",
    consult_desc: "مشاوره حرفه‌ای مهاجرت و حقوقی.",
    
    // Footer
    about_us: "درباره ما",
    contact: "تماس با ما",
    privacy: "خط مشی رازداری",
    rights: "تمامی حقوق محفوظ است.",
  },
  ar: {
    // Navbar
    home: "الرئيسية",
    visa_services: "خدمات التأشيرات",
    consultancy: "الاستشارات",
    tickets: "التذاكر",
    exit_permit: "تصريح خروج",
    track: "تتبع الطلب",
    offices: "المكاتب",
    apply_now: "قدم الآن",

    // Sub-links
    tourist_visa: "تأشيرة سياحية",
    business_visa: "تأشيرة عمل",
    student_visa: "تأشيرة طالب",
    work_visa: "تأشيرة توظيف",
    medical_visa: "تأشيرة طبية",
    visa_extensions: "تمديد التأشيرة",
    required_documents: "المستندات المطلوبة",
    visa_fees: "رسوم التأشيرة",
    eligibility_checker: "فحص الأهلية",
    
    // Hero
    hero_badge: "مساعدة تأشيرة متميزة",
    hero_title: "إرشادات الخبراء لرحلتك",
    hero_subtitle: "نحن نبسط قواعد الهجرة المعقدة ونقدم دعمًا احترافيًا شاملاً لطلب التأشيرة الإلكترونية الخاص بك.",
    explore_categories: "استكشف الفئات",
    talk_to_expert: "تحدث إلى خبير",

    // Hero Labels
    hero_badge_alt: "شريكك الموثوق للتأشيرات",
    hero_title_alt: "استكشف العالم بلا حدود",
    hero_subtitle_alt: "تقدم سيد سيرفيسز إرشادات الخبراء للتأشيرات وتذاكر الطيران والهجرة. نحول أحلامك الدولية إلى حقيقة بنسبة نجاح 99%.",
    start_application: "ابدأ طلبك",
    consult_whatsapp: "استشارة عبر واتساب",
    secure_trusted: "آمن وموثوق",
    global_reach: "وصول عالمي",
    fast_process: "عملية سريعة",
    apps_approved: "طلبات معتمدة",
    
    // Stats
    visas_approved: "تأشيرات معتمدة",
    success_rate: "معدل النجاح",
    countries: "دولة",
    years_exp: "سنوات خبرة",
    
    // Services
    our_services: "خدماتنا",
    visa_desc: "تأشيرات سياحية وتجارية ودراسية لجميع الدول الكبرى.",
    ticket_desc: "أفضل الأسعار للرحلات الداخلية والدولية.",
    consult_desc: "استشارات هجرة وقانونية مهنية.",
    
    // Footer
    about_us: "من نحن",
    contact: "اتصل بنا",
    privacy: "سياسة الخصوصية",
    rights: "جميع الحقوق محفوظة.",
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const newDir = (lang === 'ur' || lang === 'dr' || lang === 'ar') ? 'rtl' : 'ltr';
    setDir(newDir);
    localStorage.setItem('language', lang);
    document.documentElement.dir = newDir;
    document.documentElement.lang = lang;
  };

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir, t }}>
      <div dir={dir} className={dir === 'rtl' ? 'font-urdu' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
