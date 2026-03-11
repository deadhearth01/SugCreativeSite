import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <section className="pt-32 pb-20 bg-white">
        <div className="container-wide max-w-4xl">
          <span className="text-sm font-semibold text-primary-bright uppercase tracking-widest mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-8">Refund Policy</h1>
          <div className="space-y-6 text-foreground-muted leading-relaxed">
            <p><strong className="text-primary">Last Updated:</strong> February 1, 2026</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">1. Course & Training Programs</h2>
            <p>Full refunds are available if requested within 7 days of enrollment and before completing more than 20% of the course content. After this period, refunds will be prorated based on the percentage of content accessed.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">2. Consulting Services</h2>
            <p>For ongoing consulting engagements, clients may cancel with 30 days written notice. Fees for services already rendered are non-refundable. Any advance payments for future services will be refunded in full.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">3. Workshops & Events</h2>
            <p>Cancellations made 14+ days before the event receive a full refund. Cancellations within 7-14 days receive a 50% refund. No refunds for cancellations within 7 days of the event. Transfers to future events may be available.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">4. Startup Incubation Programs</h2>
            <p>Due to the intensive nature of our incubation programs, refunds are available only within the first 14 days of the program start date. After this period, fees are non-refundable.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">5. Refund Process</h2>
            <p>To request a refund, email <a href="mailto:billing@sugcreative.com" className="text-primary-bright hover:underline">billing@sugcreative.com</a> with your enrollment details and reason for the request. Refunds are processed within 7-10 business days to the original payment method.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">6. Exceptions</h2>
            <p>In case of technical issues, service failures, or circumstances beyond our control (force majeure), Sug Creative will work with affected clients to find a fair resolution, which may include full or partial refunds, service credits, or rescheduling.</p>

            <h2 className="text-xl font-heading font-bold text-primary mt-10 mb-4">7. Contact</h2>
            <p>For billing and refund inquiries: <a href="mailto:billing@sugcreative.com" className="text-primary-bright hover:underline">billing@sugcreative.com</a></p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
