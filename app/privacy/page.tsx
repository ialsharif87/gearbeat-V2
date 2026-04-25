import Link from "next/link";
import T from "../../components/t";

export default function PrivacyPage() {
  return (
    <section className="legal-page">
      <div className="legal-hero card">
        <span className="badge">
          <T en="Privacy" ar="الخصوصية" />
        </span>

        <h1>
          <T en="Privacy Policy" ar="سياسة الخصوصية" />
        </h1>

        <p>
          <T
            en="This policy explains what data GearBeat collects, why we collect it, and how it supports bookings, trust, safety, and platform operations."
            ar="توضح هذه السياسة البيانات التي تجمعها GearBeat، ولماذا نجمعها، وكيف تساعد في الحجوزات، الثقة، الأمان، وتشغيل المنصة."
          />
        </p>

        <div className="actions">
          <Link href="/terms" className="btn">
            <T en="Terms & Conditions" ar="الشروط والأحكام" />
          </Link>

          <Link href="/support" className="btn btn-secondary">
            <T en="Contact Support" ar="تواصل مع الدعم" />
          </Link>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="legal-grid">
        <div className="card legal-nav-card">
          <span className="badge">
            <T en="Summary" ar="ملخص" />
          </span>

          <h2>
            <T en="Privacy basics" ar="أساسيات الخصوصية" />
          </h2>

          <div className="legal-mini-list">
            <span>
              <T en="We collect account details" ar="نجمع بيانات الحساب" />
            </span>
            <span>
              <T en="We use data for bookings and support" ar="نستخدم البيانات للحجوزات والدعم" />
            </span>
            <span>
              <T en="Identity details support trust and safety" ar="بيانات الهوية تدعم الثقة والأمان" />
            </span>
            <span>
              <T en="Admins may access data when needed" ar="قد تصل الإدارة للبيانات عند الحاجة" />
            </span>
            <span>
              <T en="We do not sell personal data" ar="لا نبيع البيانات الشخصية" />
            </span>
          </div>
        </div>

        <div className="card legal-content-card">
          <div className="legal-section">
            <h2>
              <T en="1. Data We Collect" ar="1. البيانات التي نجمعها" />
            </h2>
            <p>
              <T
                en="GearBeat may collect your name, email address, phone number, account type, booking activity, payment status, review activity, support messages, and identity details when required."
                ar="قد تجمع GearBeat الاسم، البريد الإلكتروني، رقم الجوال، نوع الحساب، نشاط الحجز، حالة الدفع، نشاط التقييم، رسائل الدعم، وبيانات الهوية عند الحاجة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="2. Why We Collect Data" ar="2. لماذا نجمع البيانات" />
            </h2>
            <p>
              <T
                en="We use data to create accounts, manage bookings, support customers, help studio owners, improve trust and safety, prevent misuse, and operate the platform."
                ar="نستخدم البيانات لإنشاء الحسابات، إدارة الحجوزات، دعم العملاء، مساعدة أصحاب الاستوديوهات، تحسين الثقة والأمان، منع إساءة الاستخدام، وتشغيل المنصة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="3. Booking & Customer Details" ar="3. بيانات الحجز والعميل" />
            </h2>
            <p>
              <T
                en="Customer details may be shown to authorized admin users and, where needed, to studio owners for managing confirmed bookings and customer communication."
                ar="قد تظهر بيانات العميل لمستخدمي الإدارة المصرح لهم، وعند الحاجة لأصحاب الاستوديوهات لإدارة الحجوزات المؤكدة والتواصل مع العميل."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="4. Identity Details" ar="4. بيانات الهوية" />
            </h2>
            <p>
              <T
                en="Identity details may be collected to improve trust and safety. Once saved, identity details are locked and cannot be changed directly by the user from the profile page."
                ar="قد يتم جمع بيانات الهوية لتحسين الثقة والأمان. بعد حفظها، يتم قفل بيانات الهوية ولا يمكن للمستخدم تعديلها مباشرة من صفحة الملف الشخصي."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="5. Reviews & Feedback" ar="5. التقييمات والآراء" />
            </h2>
            <p>
              <T
                en="Reviews may be connected to booking activity. Published reviews may appear on public studio pages, while hidden or flagged reviews remain available internally for moderation."
                ar="قد تكون التقييمات مرتبطة بنشاط الحجز. التقييمات المنشورة قد تظهر في صفحات الاستوديو العامة، بينما تبقى التقييمات المخفية أو المعلّمة متاحة داخليًا للمراجعة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="6. Admin Access" ar="6. وصول الإدارة" />
            </h2>
            <p>
              <T
                en="Authorized admin users may access booking, customer, identity, review, and audit information when needed for support, operations, safety, or compliance."
                ar="قد يتمكن مستخدمو الإدارة المصرح لهم من الوصول إلى بيانات الحجز، العميل، الهوية، التقييم، وسجل التغييرات عند الحاجة للدعم، العمليات، الأمان، أو الالتزام."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="7. Data Security" ar="7. حماية البيانات" />
            </h2>
            <p>
              <T
                en="We use access controls, role-based permissions, internal monitoring, and audit logs to help protect platform data and reduce unauthorized access."
                ar="نستخدم صلاحيات الوصول، أدوار المستخدمين، المتابعة الداخلية، وسجلات التغيير للمساعدة في حماية بيانات المنصة وتقليل الوصول غير المصرح به."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="8. We Do Not Sell Your Data" ar="8. لا نبيع بياناتك" />
            </h2>
            <p>
              <T
                en="GearBeat does not sell user personal data to advertisers or unrelated third parties."
                ar="GearBeat لا تبيع بيانات المستخدمين الشخصية للمعلنين أو لأطراف خارجية غير مرتبطة."
              />
            </p>
          </div>

          <div className="legal-section">
            <h2>
              <T en="9. Contact" ar="9. التواصل" />
            </h2>
            <p>
              <T
                en="For privacy questions or support requests, contact GearBeat support."
                ar="لأسئلة الخصوصية أو طلبات الدعم، تواصل مع دعم GearBeat."
              />
            </p>

            <a href="mailto:support@gearbeat.com" className="btn btn-secondary">
              support@gearbeat.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
