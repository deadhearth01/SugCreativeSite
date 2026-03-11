import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="container-wide max-w-4xl">
          <span className="text-sm font-semibold text-primary-bright uppercase tracking-widest mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-8">Terms & Conditions</h1>
          <div className="space-y-6 text-foreground-muted leading-relaxed">
            <p><strong className="text-primary">Last Updated:</strong> February 1, 2026</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Sug Creative&apos;s website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">2. Services</h2>
            <p>Sug Creative provides business consulting, career guidance, startup mentorship, educational technology solutions, and related services. Specific terms may apply to individual services and will be communicated at the time of enrollment or engagement.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and to update it as needed. Sug Creative reserves the right to suspend or terminate accounts that violate these terms.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">4. Payment Terms</h2>
            <p>All fees are quoted in Indian Rupees (INR) unless otherwise specified. Payments are processed securely through our payment partners. Applicable taxes will be added to the listed prices.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">5. Intellectual Property</h2>
            <p>All content, materials, course content, branding, and technology on this platform are the intellectual property of Sug Creative. Unauthorized reproduction, distribution, or use is strictly prohibited.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">6. Limitation of Liability</h2>
            <p>Sug Creative shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid by you for the specific service in question.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">7. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">8. Contact</h2>
            <p>For questions about these terms, contact: <a href="mailto:legal@sugcreative.com" className="text-primary-bright hover:underline">legal@sugcreative.com</a></p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
