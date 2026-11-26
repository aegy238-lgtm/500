import React from 'react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] px-3 py-5"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="relative w-full max-w-[440px] max-h-[84vh] rounded-[22px] bg-[#ffffe2] border-[2.5px] border-[#51c551] shadow-[0_18px_45px_rgba(32,96,42,0.28)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center justify-center pt-5 pb-3 px-12 shrink-0">
          <h2 className="text-[#3ca342] font-extrabold text-[22px]">قواعد</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#52c74c] hover:bg-[#43b43d] active:scale-95 text-white flex items-center justify-center shadow-sm transition-transform cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Rules Body matching Screenshot 2 styling & exact text */}
        <div className="game-scroll overflow-y-auto px-6 pb-7 pt-1 text-[#a49354] text-[15px] leading-[1.85] font-semibold space-y-5">
          <div>
            <p>
              1. اختر قيمة الرهان من الأسفل (2000، 10000، 50000، 100000)، ثم اضغط على أي
              صنف طعام لوضع رهانك قبل انتهاء عداد الجولة.
            </p>
          </div>

          <div>
            <p>
              2. يمكنك الرهان على أكثر من صنف طعام في نفس الجولة، وستُحسب مكافأة كل صنف
              بناءً على مضاعف الفوز المكتوب أسفله:
            </p>
            <p className="pr-4 mt-1 text-[#968346]">
              اللحوم: السجق (فوز 10×)، الدجاج (فوز 15×)، الجمبري (فوز 25×)، الستيك (فوز 45×).
            </p>
            <p className="pr-4 mt-1 text-[#968346]">
              الخضراوات: الطماطم (فوز 5×)، الفجل (فوز 5×)، الفطر (فوز 5×)، الذرة (فوز 5×).
            </p>
          </div>

          <div>
            <p>
              3. تستمر مدة الرهان في كل جولة 20 ثانية، وبعدها يبدأ السحب العشوائي لإعلان
              الطعام الفائز في الجولة.
            </p>
          </div>

          <div>
            <p>
              4. سيتم إطلاق يانصيب خاص في كل جولة باحتمالية مُحددة. سيُختار صنف طعام واحد
              كـ &apos;طبق&apos;:
            </p>
            <p className="pr-4 mt-3">
              أ. بيتزا: إذا كانت الإجابة بيتزا، فستُصبح جميع أصناف اللحوم &apos;أطباقًا
              لذيذة&apos; وتُحتسب ضمن الفائز.
            </p>
            <p className="pr-4 mt-3">
              ب. السلطة: إذا كانت النتيجة سلطة، تُصبح جميع الخضراوات &apos;أطباقًا شهية&apos;
              وتُحتسب للفوز.
            </p>
          </div>

          <div>
            <p>5. حساب المكافأة:</p>
            <p className="mt-1">
              عملات المكافأة = عدد العملات المستثمرة في الطعام الفائز (الأطباق الشهية) ×
              مضاعف الطعام الفائز
            </p>
          </div>

          <p className="pt-2">
            قد يؤدي استخدام الغش، مثل المُحاكيات، إلى خسائر، لذا يُرجى اللعب على التطبيق
            الرسمي.
          </p>

          <p>هذه اللعبة غير تابعة لجوجل بلاي أو متجر آبل.</p>
        </div>
      </div>
    </div>
  );
};
