import T from "../../components/t";
import Link from "next/link";

export default function VendorRegisterPage() {
  return (
    <div className="section-padding" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 500, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: '3rem', marginBottom: 15 }}>📦</div>
          <h1 style={{ fontSize: '2rem' }}>
            <T en="Open your Gear Store" ar="افتح متجر المعدات الخاص بك" />
          </h1>
          <p style={{ color: 'var(--gb-muted)' }}>
            <T en="Start selling to the GCC music community today." ar="ابدأ البيع لمجتمع الموسيقى في الخليج اليوم." />
          </p>
        </div>

        <form className="grid gap-20">
          <div>
            <label><T en="Full Name" ar="الاسم الكامل" /></label>
            <input className="input" placeholder="John Doe / محمد علي" required />
          </div>
          
          <div>
            <label><T en="Email Address" ar="البريد الإلكتروني" /></label>
            <input type="email" className="input" placeholder="name@example.com" required />
          </div>

          <div>
            <label><T en="Password" ar="كلمة المرور" /></label>
            <input type="password" className="input" placeholder="••••••••" required />
          </div>

          <div style={{ padding: '15px', background: 'rgba(199,164,93,0.05)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--gb-gold)' }}>
             <T 
               en="By signing up, you agree to GearBeat's Vendor Terms & Conditions." 
               ar="بتسجيلك، أنت توافق على شروط وأحكام التجار في GearBeat." 
             />
          </div>

          <button type="submit" className="btn btn-primary w-full btn-large">
            <T en="Create Vendor Account" ar="إنشاء حساب تاجر" />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 25, fontSize: '0.9rem' }}>
           <T en="Already have an account?" ar="لديك حساب بالفعل؟" />{' '}
           <Link href="/login" className="text-link"><T en="Login here" ar="سجل دخولك هنا" /></Link>
        </div>
      </div>
    </div>
  );
}
