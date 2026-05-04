export function generateStudioContract({
  sellerNameAr,
  sellerNameEn,
  companyNameAr,
  companyNameEn,
  email,
  phone,
  city,
  commissionPercent,
  contractDate,
  contractDurationMonths = 12,
}: {
  sellerNameAr: string
  sellerNameEn: string
  companyNameAr: string
  companyNameEn: string
  email: string
  phone: string
  city: string
  commissionPercent: number
  contractDate: string
  contractDurationMonths?: number
}): string {
  
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + contractDurationMonths);
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { 
    font-family: 'Arial', sans-serif; 
    background: #fff; 
    color: #1a1a1a;
    font-size: 14px;
    line-height: 1.8;
    direction: rtl;
  }
  .page { 
    max-width: 800px; 
    margin: 0 auto; 
    padding: 60px 50px;
  }
  .header { 
    text-align: center; 
    border-bottom: 3px solid #3b82f6; 
    padding-bottom: 30px; 
    margin-bottom: 40px;
  }
  .logo { 
    font-size: 28px; 
    font-weight: 900; 
    color: #3b82f6; 
    letter-spacing: 2px;
    margin-bottom: 8px;
  }
  .contract-title { 
    font-size: 20px; 
    font-weight: 700; 
    color: #1a1a1a;
    margin-top: 12px;
  }
  .contract-subtitle {
    font-size: 13px;
    color: #666;
    margin-top: 4px;
  }
  .section { margin-bottom: 32px; }
  .section-title { 
    font-size: 16px; 
    font-weight: 700; 
    color: #3b82f6;
    border-right: 4px solid #3b82f6;
    padding-right: 12px;
    margin-bottom: 16px;
  }
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    background: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
  }
  .info-item { }
  .info-label { 
    font-size: 11px; 
    color: #888; 
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .info-value { 
    font-size: 14px; 
    color: #1a1a1a;
    font-weight: 600;
  }
  .highlight-box {
    background: #f0f7ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 20px;
    margin: 16px 0;
  }
  .commission-number {
    font-size: 36px;
    font-weight: 900;
    color: #3b82f6;
    text-align: center;
    display: block;
  }
  .clause { 
    margin-bottom: 16px;
    padding-right: 16px;
    border-right: 2px solid #eee;
  }
  .clause-number {
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 4px;
  }
  .signature-section {
    margin-top: 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
  .signature-box {
    border-top: 2px solid #1a1a1a;
    padding-top: 16px;
    text-align: center;
  }
  .signature-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }
  .signature-name {
    font-size: 14px;
    font-weight: 700;
  }
  .signature-space {
    height: 80px;
    border: 1px dashed #ccc;
    border-radius: 8px;
    margin: 12px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 12px;
  }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    text-align: center;
    font-size: 11px;
    color: #999;
  }
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80px;
    color: rgba(59, 130, 246, 0.05);
    font-weight: 900;
    pointer-events: none;
    white-space: nowrap;
  }
</style>
</head>
<body>
<div class="watermark">GearBeat</div>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo">GearBeat</div>
    <div style="font-size: 12px; color: #888; letter-spacing: 1px;">
      STUDIO. SOUND. CONNECTED.
    </div>
    <div class="contract-title">عقد انضمام استوديو</div>
    <div class="contract-subtitle">Studio Partnership Agreement</div>
    <div style="margin-top: 12px; font-size: 12px; color: #666;">
      رقم العقد: GB-ST-${Date.now().toString().slice(-8)} | 
      تاريخ الإصدار: ${contractDate}
    </div>
  </div>

  <!-- PARTIES -->
  <div class="section">
    <div class="section-title">أطراف العقد</div>
    
    <div style="margin-bottom: 16px;">
      <strong>الطرف الأول — المنصة:</strong><br/>
      شركة GearBeat للتقنية<br/>
      المملكة العربية السعودية<br/>
      البريد الإلكتروني: partners@gearbeat.sa
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">اسم المسؤول</div>
        <div class="info-value">${sellerNameAr}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Owner Name</div>
        <div class="info-value">${sellerNameEn}</div>
      </div>
      <div class="info-item">
        <div class="info-label">اسم الاستوديو</div>
        <div class="info-value">${companyNameAr}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Studio Name</div>
        <div class="info-value">${companyNameEn}</div>
      </div>
      <div class="info-item">
        <div class="info-label">البريد الإلكتروني</div>
        <div class="info-value">${email}</div>
      </div>
      <div class="info-item">
        <div class="info-label">رقم الجوال</div>
        <div class="info-value">${phone}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المدينة</div>
        <div class="info-value">${city}</div>
      </div>
      <div class="info-item">
        <div class="info-label">تاريخ بدء العقد</div>
        <div class="info-value">${contractDate}</div>
      </div>
    </div>
  </div>

  <!-- COMMISSION -->
  <div class="section">
    <div class="section-title">نسبة العمولة</div>
    <div class="highlight-box">
      <span class="commission-number">${commissionPercent}%</span>
      <p style="text-align: center; color: #666; margin-top: 8px; font-size: 13px;">
        نسبة العمولة المتفق عليها من إجمالي قيمة كل حجز مؤكد
      </p>
      <p style="text-align: center; color: #666; font-size: 13px;">
        Agreed commission rate on total value of each confirmed booking
      </p>
    </div>
  </div>

  <!-- CONTRACT DURATION -->
  <div class="section">
    <div class="section-title">مدة العقد</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">تاريخ البداية</div>
        <div class="info-value">${contractDate}</div>
      </div>
      <div class="info-item">
        <div class="info-label">تاريخ الانتهاء</div>
        <div class="info-value">${endDate.toLocaleDateString('ar-SA')}</div>
      </div>
    </div>
    <p style="margin-top: 12px; color: #666; font-size: 13px;">
      يُجدَّد العقد تلقائياً لمدة مماثلة ما لم يُخطر أي طرف الآخر بعدم الرغبة في التجديد قبل 30 يوماً من تاريخ الانتهاء.
    </p>
  </div>

  <!-- TERMS -->
  <div class="section">
    <div class="section-title">الشروط والأحكام</div>
    
    <div class="clause">
      <div class="clause-number">1. التزامات الاستوديو</div>
      <p>يلتزم الاستوديو بتقديم خدمات احترافية وبالمواصفات المعلنة، والحفاظ على نظافة وجاهزية المكان في أوقات الحجز، وعدم إلغاء الحجوزات المؤكدة إلا في حالات الطوارئ.</p>
    </div>
    
    <div class="clause">
      <div class="clause-number">2. التزامات المنصة</div>
      <p>تلتزم GearBeat بتوفير نظام حجز متكامل وتسوية المستحقات المالية للاستوديو خلال 7 أيام عمل من اكتمال الحجز وتأكيده.</p>
    </div>
    
    <div class="clause">
      <div class="clause-number">3. سياسة الإلغاء</div>
      <p>تخضع سياسة الإلغاء للشروط والأحكام المعلنة في المنصة. يلتزم الاستوديو بتعويض العميل أو توفير موعد بديل عند الإلغاء من طرفه بشكل غير مبرر.</p>
    </div>
    
    <div class="clause">
      <div class="clause-number">4. صيانة المعدات</div>
      <p>يتحمل الاستوديو مسؤولية سلامة وجودة المعدات المذكورة في صفحته الشخصية، ويجب عليه إخطار المنصة فوراً في حال تعطل أي معدة أساسية تؤثر على الحجز.</p>
    </div>
    
    <div class="clause">
      <div class="clause-number">5. السرية وحماية البيانات</div>
      <p>يلتزم كلا الطرفين بالحفاظ على سرية المعلومات التجارية وبيانات العملاء وفقاً لأنظمة حماية البيانات المعمول بها في المملكة العربية السعودية.</p>
    </div>

    <div class="clause">
      <div class="clause-number">6. إنهاء العقد وتصفية الحسابات</div>
      <p>يحق لأي من الطرفين إنهاء العقد بإشعار مسبق مدته 30 يوماً، مع ضرورة الوفاء بجميع الحجوزات القائمة قبل تاريخ الإنهاء الفعلي.</p>
    </div>
  </div>

  <!-- SIGNATURES -->
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-label">الطرف الأول — GearBeat</div>
      <div class="signature-space">التوقيع</div>
      <div class="signature-name">ممثل GearBeat المفوض</div>
      <div style="font-size: 12px; color: #888; margin-top: 4px;">
        التاريخ: ${contractDate}
      </div>
    </div>
    <div class="signature-box">
      <div class="signature-label">الطرف الثاني — الاستوديو</div>
      <div class="signature-space">التوقيع</div>
      <div class="signature-name">${sellerNameAr}</div>
      <div style="font-size: 12px; color: #888; margin-top: 4px;">
        التاريخ: _______________
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <p>GearBeat — Studio. Sound. Connected.</p>
    <p>هذا العقد وثيقة رسمية ملزمة قانونياً لكلا الطرفين</p>
    <p style="margin-top: 4px; color: #ccc;">
      تم إصداره في ${contractDate} | 
      رقم العقد: GB-ST-${Date.now().toString().slice(-8)}
    </p>
  </div>

</div>
</body>
</html>
  `
}
