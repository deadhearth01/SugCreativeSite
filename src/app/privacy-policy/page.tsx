import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="container-wide max-w-4xl">
          <span className="text-sm font-semibold text-primary-bright uppercase tracking-widest mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-8">Privacy Policy</h1>
          <div className="prose prose-navy max-w-none space-y-6 text-foreground-muted leading-relaxed">
            <p className="text-foreground-muted"><strong className="text-primary">Last Updated:</strong> February 1, 2026</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as when you create an account, enroll in courses, submit contact forms, or interact with our services. This includes your name, email, phone number, professional details, and payment information.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">2. How We Use Your Information</h2>
            <p>We use collected information to: provide and improve our services, process transactions, send communications, personalize your experience, and comply with legal obligations.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">3. Data Sharing</h2>
            <p>We do not sell your personal data. We may share it with trusted service providers who assist in operating our platform, conducting our business, or servicing you, provided they agree to keep this information confidential.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your data. However, no method of electronic storage is 100% secure.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">5. Cookies</h2>
            <p>We use cookies and similar technologies to enhance your experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may also opt out of marketing communications at any time. Contact us at privacy@sugcreative.com for requests.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">7. Contact</h2>
            <p>For privacy-related inquiries, contact us at: <a href="mailto:privacy@sugcreative.com" className="text-primary-bright hover:underline">privacy@sugcreative.com</a></p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
