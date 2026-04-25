import T from "../../components/t";

export default function PrivacyPage() {
  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Privacy" ar="الخصوصية" />
        </span>

        <h1>
          <T en="Privacy Policy" ar="سياسة الخصوصية" />
        </h1>

        <p>
          <T
            en="This page explains what data GearBeat collects and how it is used."
            ar="توضح هذه الصفحة البيانات التي تجمعها GearBeat وكيف يتم استخدامها."
          />
        </p>
      </div>

      <div className="card">
        <h2>
          <T en="Data We Collect" ar="البيانات التي نجمعها" />
        </h2>
        <p>
          <T
            en="We may collect your name, email, phone number, account type, booking activity, review activity, and identity details."
            ar="قد نجمع الاسم، البريد الإلكتروني، رقم الجوال، نوع الحساب، نشاط الحجز، نشاط التقييم، وبيانات الهوية."
          />
        </p>

        <h2>
          <T en="Why We Use Data" ar="لماذا نستخدم البيانات" />
        </h2>
        <p>
          <T
            en="We use data to manage bookings, improve trust and safety, support users, prevent misuse, and operate the platform."
            ar="نستخدم البيانات لإدارة الحجوزات، تحسين الثقة والأمان، دعم المستخدمين، منع إساءة الاستخدام، وتشغيل المنصة."
          />
        </p>

        <h2>
          <T en="Who Can See Data" ar="من يستطيع رؤية البيانات" />
        </h2>
        <p>
          <T
            en="Authorized admin users may access booking and customer details when needed for support, operations, safety, or compliance."
            ar="قد يتمكن مستخدمو الإدارة المصرح لهم من الوصول إلى بيانات الحجز والعميل عند الحاجة للدعم أو العمليات أو الأمان أو الالتزام."
          />
        </p>

        <h2>
          <T en="We Do Not Sell Your Data" ar="لا نبيع بياناتك" />
        </h2>
        <p>
          <T
            en="GearBeat does not sell user personal data to advertisers or third parties."
            ar="GearBeat لا تبيع بيانات المستخدمين الشخصية للمعلنين أو أطراف خارجية."
          />
        </p>
      </div>
    </section>
  );
}
