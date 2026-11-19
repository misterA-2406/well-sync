import React from 'react';
import {
  Info,
  AlertTriangle,
  Scale,
  BookOpen,
  Award,
} from 'lucide-react';
import { Language, t } from '../i18n/translations';

interface AboutScreenProps {
  language: Language;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ language }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. OVERVIEW HERO */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-forest-50 border border-forest-200 text-forest-700 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-forest-100 text-forest-900 border border-forest-300">
                <Award className="w-3.5 h-3.5 text-forest-700" />
                <span>{t('about.challenge_badge', language)}</span>
              </span>
              <span className="text-xs text-ink-500 font-medium">
                {t('about.challenge_title', language)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 tracking-tight">
              {t('about.title', language)}
            </h1>

            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-3xl">
              {language === 'ar'
                ? 'WellSync هو نموذج أولي للمنافسة تم تصميمه للحفاظ على النشاط البدني وروتين النوم من خلال معايرة أهداف تكيفية وغير عقابية.'
                : 'WellSync is a competition prototype engineered to sustain physical movement and sleep habits through adaptive, non-punitive goal calibration.'}
            </p>

            <div className="pt-1 text-[11px] font-semibold text-sand-800 bg-sand-50 border border-sand-200 px-3 py-1.5 rounded-xl inline-block">
              {language === 'ar'
                ? 'نموذج أولي للطلاب، وليس تابعاً لأي منتج تجاري يحمل اسم WellSync.'
                : 'Student prototype, not affiliated with any commercial product named WellSync.'}
            </div>
          </div>
        </div>
      </section>

      {/* 2. TEAM & CLINICAL SCOPE DISCLOSURES */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div className="pb-3 border-b border-ink-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-forest-700" />
            <span>{language === 'ar' ? 'شفافية الفريق ونطاق العمل' : 'Team Status & Scope Transparency'}</span>
          </h2>
          <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
            Ethics &amp; Disclosure
          </span>
        </div>

        <div className="bg-ivory-50 border border-ink-200/80 rounded-2xl p-5 text-xs text-ink-700 space-y-3 leading-relaxed">
          <p>
            <strong className="text-forest-950 font-bold">{language === 'ar' ? 'المؤلفون / الفريق:' : 'Authors / Team:'}</strong>{' '}
            <span className="font-semibold text-ink-900">1. Ayesha Sutana &nbsp;•&nbsp; 2. B. Alence</span>
            <span className="block text-ink-600 text-[11px] mt-0.5">
              {language === 'ar'
                ? 'طالبان جامعيان طورا هذا المشروع المستقل للمنافسة. نموذج أولي للطلاب، وليس تابعاً لأي منتج تجاري يحمل اسم WellSync.'
                : 'Undergraduate student engineering team. Student prototype, not affiliated with any commercial product named WellSync.'}
            </span>
          </p>
          <p>
            <strong className="text-forest-950 font-bold">{language === 'ar' ? 'الوضع السريري:' : 'Clinical Status:'}</strong>{' '}
            {language === 'ar'
              ? 'ليس لدينا شريك سريري، ولم نجرِ أي تجارب سريرية حية، ولم نجرِ أي اختبارات على مستخدمين بشريين.'
              : 'We have no clinical partner, have conducted no live clinical trials, and have conducted no human user testing.'}
          </p>
          <p>
            <strong className="text-forest-950 font-bold">{language === 'ar' ? 'إخلاء المسؤولية الطبية:' : 'Zero Medical Claims:'}</strong>{' '}
            {language === 'ar'
              ? 'يقدم WellSync دعماً سلوكياً فقط. وهو ليس جهازاً طبياً، ولا يقدم تشخيصات سريرية، ولا يقترح خطط علاج، ولا يستنتج أي حالات طبية من المؤشرات المسجلة.'
              : 'WellSync provides behavioral habit support only. It is not a medical device, does not provide clinical diagnoses, does not offer treatment plans, and infers zero medical conditions from recorded metrics.'}
          </p>
          <p>
            <strong className="text-forest-950 font-bold">{language === 'ar' ? 'بنية قائمة على القواعد 100%:' : 'Rule-Based Architecture:'}</strong>{' '}
            {t('about.rules_desc', language)}
          </p>
        </div>
      </section>

      {/* 3. SCIENTIFIC FRAMEWORK & CITATIONS */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div className="pb-3 border-b border-ink-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forest-700" />
            <span>{language === 'ar' ? 'العلوم السلوكية ومصادر البيانات' : 'Behavioral Science & Data Grounding'}</span>
          </h2>
          <span className="text-[11px] font-bold text-forest-800 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
            Open Science
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-ink-200 bg-ivory-50/70 space-y-2">
            <h3 className="font-bold text-ink-900 text-sm">Michie et al. (2013) BCTTv1</h3>
            <p className="text-ink-600 leading-relaxed">
              {language === 'ar'
                ? 'كل اقتراح وتوجيه يقدمه التطبيق يرتبط مباشرة بتصنيف تقنيات تغيير السلوك المنشور:'
                : 'Every suggestion provided by the app is mapped directly to the published Behavior Change Technique Taxonomy v1:'}
            </p>
            <ul className="list-disc list-inside text-ink-600 space-y-1 text-[11px]">
              <li>
                <strong>BCT 8.7 Graded Tasks:</strong>{' '}
                {language === 'ar' ? 'المستوى الأدنى 50% عند التراجع' : '50% Minimum ladder rung upon lapse'}
              </li>
              <li>
                <strong>BCT 1.4 Action Planning:</strong>{' '}
                {language === 'ar' ? 'التزامات مصغرة استباقية' : 'Proactive micro-commitments'}
              </li>
              <li>
                <strong>BCT 2.2 Feedback on Behaviour:</strong>{' '}
                {language === 'ar' ? 'متابعة مسار التعافي المستمر' : 'Continuous recovery tracking'}
              </li>
              <li>
                <strong>BCT 1.1 Goal Setting:</strong>{' '}
                {language === 'ar' ? 'مواءمة المستوى المستهدف' : 'Target rung alignment'}
              </li>
              <li>
                <strong>BCT 1.5 Review Behaviour Goal(s):</strong>{' '}
                {language === 'ar' ? 'المستوى الموسع الاختياري +10%' : 'Optional +10% stretch rung'}
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl border border-ink-200 bg-ivory-50/70 space-y-2">
            <h3 className="font-bold text-ink-900 text-sm">{t('about.lifesnaps_title', language)}</h3>
            <p className="text-ink-600 leading-relaxed text-[11px]">
              {language === 'ar'
                ? 'يستخدم تقييم إعادة المحاكاة بيانات دراسة LifeSnaps المنشورة في مجلة Nature Scientific Data (2022):'
                : 'Our offline replay evaluation uses the peer-reviewed open-access LifeSnaps dataset published in Nature Scientific Data (2022):'}
            </p>
            <div className="p-3 bg-white rounded-xl border border-ink-200 text-[11px] text-ink-700 space-y-1 font-mono">
              <p><strong>Title:</strong> LifeSnaps, a 4-month multi-modal dataset capturing unobtrusive snapshots of our lives in the wild</p>
              <p><strong>Authors:</strong> Sofia Yfantidou, Christina Karagianni, Stefanos Efstathiou, Athena Vakali, João Palotti, Dimitrios Panteleimon Giakatos, Thomas Marchioro, Andrei Kazlouski, Elena Ferrari, and Šarūnas Girdzijauskas</p>
              <p><strong>Journal:</strong> <em>Scientific Data</em> 9, Article 669 (2022)</p>
              <p><strong>DOI:</strong> <a href="https://doi.org/10.1038/s41597-022-01764-x" target="_blank" rel="noreferrer" className="text-forest-700 underline">10.1038/s41597-022-01764-x</a></p>
              <p><strong>PMCID:</strong> <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9622868/" target="_blank" rel="noreferrer" className="text-forest-700 underline">PMC9622868</a></p>
              <p><strong>Repository:</strong> Zenodo Record <a href="https://doi.org/10.5281/zenodo.7229547" target="_blank" rel="noreferrer" className="text-forest-700 underline">7229547</a></p>
              <p><strong>License:</strong> Creative Commons Attribution 4.0 International (CC BY 4.0)</p>
            </div>
            <p className="text-[10px] text-ink-500 pt-1">
              <strong>{language === 'ar' ? 'تنبيه ديموغرافي:' : 'Demographic Notice:'}</strong> {t('evidence.disclaimer_2', language)}
            </p>
          </div>
        </div>
      </section>

      {/* 4. OUT OF SCOPE FEATURES & COERCION DEFENSE */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-ink-200 shadow-card space-y-4">
        <div className="pb-3 border-b border-ink-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-ink-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-sand-700" />
            <span>{t('about.excluded_title', language)}</span>
          </h2>
          <span className="text-[11px] font-bold text-sand-800 bg-[#FAF4EB] px-2.5 py-0.5 rounded-full border border-[#ECD9BD]">
            Anti-Surveillance Design
          </span>
        </div>

        <div className="text-xs text-ink-600 space-y-3 leading-relaxed">
          <p>{t('about.excluded_desc', language)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50">
              <strong className="text-ink-900 block font-bold mb-1">
                {language === 'ar'
                  ? '1. تقارير ومشاركات أرباب العمل والتأمين'
                  : '1. Employer / Insurer Views & Data Exports'}
              </strong>
              <p className="text-[11px] text-ink-500 leading-relaxed">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'تخلق بيئة مراقبة في مكان العمل وتجبر المستخدمين على المشاركة وتفرض عقوبات وظيفية أو تأمينية على الأيام غير المكتملة.'
                  : 'Creates workplace surveillance, coercive participation, and punitive employment or insurance consequences for missed days.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50">
              <strong className="text-ink-900 block font-bold mb-1">
                {language === 'ar'
                  ? '2. لوحات المتصدرين والمقارنات الاجتماعية'
                  : '2. Public Leaderboards & Peer Social Comparisons'}
              </strong>
              <p className="text-[11px] text-ink-500 leading-relaxed">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'تسبب التصنيفات العلنية الوصم والشعور بالذنب، مما يعزز أثر الإحباط والتخلي عن العادة تماماً لدى المستخدمين المتعثرين.'
                  : 'Public rankings induce stigma and shame, exacerbating the "what-the-hell effect" and causing vulnerable users to abandon interventions.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50">
              <strong className="text-ink-900 block font-bold mb-1">
                {language === 'ar'
                  ? '3. روبوتات الدردشة التوليدية والتشخيص الآلي'
                  : '3. AI Chatbots / Generative Diagnosis'}
              </strong>
              <p className="text-[11px] text-ink-500 leading-relaxed">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'النماذج التوليدية تهلوس بالنصائح الطبية وتوهم المستخدم بسلطة سريرية وهمية لا أساس لها.'
                  : 'Unconstrained generative models hallucinate health advice and create dangerous illusions of medical authority.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-ink-200 bg-ivory-50">
              <strong className="text-ink-900 block font-bold mb-1">
                {language === 'ar'
                  ? '4. عدادات التتابع التي تعود إلى الصفر'
                  : '4. Reset-to-Zero Streak Counters'}
              </strong>
              <p className="text-[11px] text-ink-500 leading-relaxed">
                <em>{language === 'ar' ? 'المخاطر:' : 'Risk:'}</em>{' '}
                {language === 'ar'
                  ? 'محو أسابيع من الجهد المتراكم بسبب ظرف قهري مؤقت يسبب الإحباط والانسحاب من البرنامج.'
                  : 'Erasing weeks of accumulated effort due to an unavoidable life disruption causes demoralization and disengagement.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
