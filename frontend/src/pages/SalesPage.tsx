import { useState } from 'react'
import {
  CheckCircle,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  ChevronDown,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
  BarChart2,
  Repeat,
  Award,
} from 'lucide-react'

// ─── Reusable components ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-yellow-400 text-green-900 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
      {children}
    </span>
  )
}

function Check({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  )
}

function CtaButton({ children, size = 'lg' }: { children: React.ReactNode; size?: 'lg' | 'xl' }) {
  return (
    <a
      href="#get-access"
      className={`inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-black rounded-xl shadow-lg shadow-yellow-400/30 transition-all hover:scale-105 active:scale-95 ${
        size === 'xl'
          ? 'text-xl px-10 py-5'
          : 'text-base px-8 py-4'
      }`}
    >
      {children}
    </a>
  )
}

function TestimonialCard({
  name,
  location,
  quote,
  result,
}: {
  name: string
  location: string
  quote: string
  result: string
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed italic">"{quote}"</p>
      <div className="mt-auto pt-4 border-t border-white/10">
        <p className="font-bold text-white">{name}</p>
        <p className="text-gray-400 text-xs">{location}</p>
        <p className="text-yellow-400 font-bold text-sm mt-1">{result}</p>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-yellow-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-300 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  return (
    <div className="bg-green-950 text-white font-sans antialiased">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-50 bg-green-900/95 backdrop-blur border-b border-yellow-400/20 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-yellow-300 font-semibold hidden sm:block">
            🔥 Limited-Time Offer — Founding Member Pricing Ends Soon
          </p>
          <a
            href="#get-access"
            className="ml-auto inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-900 font-black text-sm px-5 py-2 rounded-lg transition-all hover:scale-105"
          >
            Get Instant Access <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-800 via-green-950 to-green-950 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" /> WarriorPlus Product Offering
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6">
            Launch Your Own{' '}
            <span className="text-yellow-400">B2B Agency</span>
            <br />
            Selling Rewards Programs
            <br />
            <span className="text-yellow-400">to Smoke Shops</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            The high-demand, recurring revenue model that hands you a{' '}
            <span className="text-white font-bold">complete business-in-a-box</span> — no
            technical skills required, no cold calling, no inventory.
          </p>

          {/* Hero image */}
          <div className="relative inline-block mb-10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-yellow-400/20 max-w-2xl w-full">
            <img
              src="/offering.png"
              alt="Launch Your Own B2B Agency — Sell Rewards Programs to Smoke Shops"
              className="w-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {[
              { icon: Zap, label: 'Easy to Sell System' },
              { icon: Repeat, label: 'Monthly Recurring Income' },
              { icon: BookOpen, label: 'Full Training Included' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <Icon className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <CtaButton size="xl">
            Yes! Give Me Instant Access <ArrowRight className="h-5 w-5" />
          </CtaButton>
          <p className="text-gray-400 text-xs mt-3">
            Secure checkout · 30-day money-back guarantee · Instant digital delivery
          </p>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-green-900/40 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Sound familiar?</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
            Tired of chasing clients, low margins,
            and income that disappears next month?
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Most people trying to build an agency get stuck in the same trap: trading hours for dollars,
            constantly hunting for the next client, and offering services that are easy to cut when
            business gets slow.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            The problem isn't your work ethic. It's the <em>model</em>. You need a service that business
            owners genuinely <strong className="text-white">need</strong>, that delivers obvious ROI, and
            that locks in predictable recurring revenue month after month — even while you sleep.
          </p>
          <ul className="space-y-3 text-gray-300">
            {[
              'No product that stands out from every other "marketing agency"',
              'Clients who churn the moment their budget tightens',
              'Feast-or-famine income with no predictability',
              'Burning out on deliverables with no end in sight',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>The opportunity</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-6 leading-tight">
            There are <span className="text-yellow-400">70,000+ smoke shops</span> in the U.S. —
            and almost none of them have a loyalty program.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            The smoke shop industry is booming, with billions spent annually on vape products, tobacco,
            glass, and accessories. These owners are sitting on a goldmine of repeat customers — but
            they have zero system to keep those customers coming back.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            That's where <strong className="text-white">you</strong> come in. You walk into any smoke shop,
            show them a ready-to-run digital rewards platform, and charge them a small monthly fee to run it.
            They get more loyal customers and higher revenue. You get a recurring check every single month.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed mb-10">
            We've built the entire platform. We've written the sales scripts. We've packaged the training.
            <strong className="text-white"> All you have to do is show up and sign clients.</strong>
          </p>
          <CtaButton>Claim Your Agency License <ArrowRight className="h-4 w-4" /></CtaButton>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-green-900/40 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Dead simple</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black">How it works in 3 steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Users,
                title: 'Find a smoke shop',
                body: 'Use our prospecting guide to identify smoke shops in your area. Walk in or call — our one-page pitch sheet does the heavy lifting for you.',
              },
              {
                step: '02',
                icon: Zap,
                title: 'Onboard them in minutes',
                body: 'Set up their branded rewards portal using our done-for-you onboarding checklist. No tech skills needed. Most setups take under an hour.',
              },
              {
                step: '03',
                icon: Repeat,
                title: 'Collect every month',
                body: 'Charge $197–$497/month per client. Once they\'re live, the platform runs itself. You stack clients and watch the recurring revenue grow.',
              },
            ].map(({ step, icon: Icon, title, body }) => (
              <div key={step} className="relative bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="absolute -top-4 left-6 text-5xl font-black text-yellow-400/20 select-none">
                  {step}
                </span>
                <div className="h-10 w-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-4 mt-4">
                  <Icon className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Income potential ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>The math</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black">
              What does <span className="text-yellow-400">10 clients</span> actually look like?
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {[
              { clients: 5, monthly: '$1,485', annual: '$17,820', label: 'Side income' },
              { clients: 10, monthly: '$2,970', annual: '$35,640', label: 'Replace your job' },
              { clients: 25, monthly: '$7,425', annual: '$89,100', label: 'Scale mode' },
            ].map(({ clients, monthly, annual, label }) => (
              <div
                key={clients}
                className="bg-green-900/50 border border-yellow-400/20 rounded-2xl p-6 text-center"
              >
                <p className="text-gray-400 text-sm mb-1">{label}</p>
                <p className="text-4xl font-black text-yellow-400 mb-1">{monthly}</p>
                <p className="text-gray-400 text-sm mb-3">per month</p>
                <div className="border-t border-white/10 pt-3">
                  <p className="text-white font-bold">{annual}/yr</p>
                  <p className="text-gray-500 text-xs">{clients} clients @ $297/mo avg</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm">
            * Based on average client rate of $297/month. Results not guaranteed and will vary by effort and market.
          </p>
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="bg-green-900/40 py-20 px-4" id="whats-included">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Everything you need</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black">
              Your complete <span className="text-yellow-400">business-in-a-box</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: BarChart2,
                title: 'Done-For-You Rewards Platform',
                items: [
                  'Fully built customer loyalty & rewards software',
                  'Branded portal for each smoke shop client',
                  'Point tracking, redemption, and purchase history',
                  'Staff management with admin/staff roles',
                  'Mobile-friendly dashboard for shop owners',
                ],
              },
              {
                icon: BookOpen,
                title: 'Complete Agency Training',
                items: [
                  'Step-by-step client acquisition playbook',
                  'Proven sales scripts — walk in and close',
                  'Objection handling cheat sheet',
                  'Pricing & packaging guidance',
                  'Video walkthroughs for every module',
                ],
              },
              {
                icon: Users,
                title: 'Client Onboarding System',
                items: [
                  'Done-for-you onboarding checklist',
                  'Welcome email templates for shop owners',
                  'Staff training guide to hand to each client',
                  'First-30-days activation plan',
                  'Retention & upsell playbook',
                ],
              },
              {
                icon: TrendingUp,
                title: 'Marketing & Prospecting Assets',
                items: [
                  'One-page pitch sheet (print & digital)',
                  'Cold outreach email templates',
                  'Social proof talking points',
                  'Local market prospecting guide',
                  'Lead tracker spreadsheet',
                ],
              },
            ].map(({ icon: Icon, title, items }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h3 className="font-bold">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <Check key={item}><span className="text-gray-300 text-sm">{item}</span></Check>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bonus */}
          <div className="mt-6 bg-yellow-400/10 border-2 border-yellow-400/40 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Award className="h-6 w-6 text-yellow-400 shrink-0" />
              <p className="font-black text-yellow-300 text-lg">BONUS: Private Community Access</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get exclusive access to our private agency community where you can ask questions, share
              wins, get feedback on your pitch, and connect with other agency owners running this same
              model. Monthly live Q&A calls included.
            </p>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>Real results</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black">
              Agency owners are already winning
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <TestimonialCard
              name="Marcus T."
              location="Phoenix, AZ"
              quote="I signed my first 3 clients in the first two weeks. The pitch sheet alone is worth the price of admission. Shop owners get it immediately — they already know they need this."
              result="3 clients · $891/mo recurring"
            />
            <TestimonialCard
              name="Renee W."
              location="Atlanta, GA"
              quote="I had zero tech experience and zero sales background. The training walks you through everything. I literally just followed the steps. My 7th client just onboarded this morning."
              result="7 clients · $2,079/mo recurring"
            />
            <TestimonialCard
              name="David L."
              location="Las Vegas, NV"
              quote="I've tried five different agency models and this is the first one where clients actually stay. The software delivers real results for shop owners so nobody cancels. Retention is incredible."
              result="12 clients · $3,564/mo recurring"
            />
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="bg-green-900/40 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionLabel>Is this for you?</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-8">
            This is perfect for you if…
          </h2>
          <ul className="space-y-3 text-gray-300 text-lg mb-10">
            {[
              'You want a real, scalable business — not another side hustle',
              'You\'re tired of one-off projects with no residual income',
              'You want to sell something with obvious, measurable value',
              'You have no tech background but you can follow a system',
              'You want to work locally and build real relationships with business owners',
              'You\'re ready to put in the work to land your first few clients',
            ].map((item) => (
              <Check key={item}>{item}</Check>
            ))}
          </ul>

          <h3 className="font-bold text-xl mb-4 text-gray-400">This is NOT for you if…</h3>
          <ul className="space-y-3 text-gray-400">
            {[
              'You expect to make money without signing a single client',
              'You\'re looking for a get-rich-quick scheme with no effort',
              'You aren\'t willing to have real conversations with business owners',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="text-red-500 font-bold shrink-0 mt-0.5">✕</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Offer / Pricing ── */}
      <section className="py-20 px-4" id="get-access">
        <div className="max-w-2xl mx-auto text-center">
          <SectionLabel>Limited-time offer</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Get everything for one low price
          </h2>
          <p className="text-gray-400 mb-10">
            Founding member pricing is available for a limited time. Lock it in before it goes up.
          </p>

          <div className="bg-white/5 border-2 border-yellow-400/40 rounded-3xl p-8 mb-6">
            <p className="text-gray-400 text-sm mb-1">Everything included — one-time investment</p>
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="text-gray-500 line-through text-2xl">$497</span>
              <span className="text-6xl font-black text-yellow-400">$47</span>
            </div>
            <p className="text-gray-400 text-sm mb-8">One-time payment · Instant access</p>

            <ul className="text-left space-y-2 mb-8">
              {[
                'Full rewards platform agency license',
                'Complete agency training (video + written)',
                'Done-for-you sales scripts & pitch sheet',
                'Client onboarding system & templates',
                'Marketing & prospecting playbook',
                'Private community + monthly live Q&A',
              ].map((item) => (
                <Check key={item}><span className="text-gray-200 text-sm">{item}</span></Check>
              ))}
            </ul>

            <CtaButton size="xl">
              Get Instant Access Now <ArrowRight className="h-5 w-5" />
            </CtaButton>
            <p className="text-gray-500 text-xs mt-3">
              Secure checkout via WarriorPlus · All major cards accepted
            </p>
          </div>

          {/* Guarantee */}
          <div className="flex items-start gap-4 bg-green-900/40 border border-white/10 rounded-2xl p-6 text-left">
            <Shield className="h-10 w-10 text-yellow-400 shrink-0 mt-1" />
            <div>
              <p className="font-bold text-white mb-1">30-Day Money-Back Guarantee</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                If you go through the training, use the scripts, and genuinely try to sign clients and
                it doesn't work out, email us within 30 days for a full refund. No hoops to jump through.
                We stand behind this completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-green-900/40 py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>Got questions?</SectionLabel>
            <h2 className="text-3xl font-black">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                question: 'Do I need any technical experience?',
                answer:
                  'None at all. The platform is fully built and managed for you. Your job is to sign clients and hand them off to our onboarding system. If you can send an email and use a smartphone, you have the skills needed.',
              },
              {
                question: 'Do I need to be local to smoke shops?',
                answer:
                  'Local is the best way to start — walking into a shop is the most effective pitch. But many agency owners also work remotely via phone and video. The training covers both approaches.',
              },
              {
                question: 'What do I charge clients?',
                answer:
                  'We recommend starting at $197–$297/month per shop. As you build case studies and results, you can move toward $397–$497/month. The training walks you through pricing strategy in detail.',
              },
              {
                question: 'How quickly can I sign my first client?',
                answer:
                  'Many students sign their first client within the first two weeks. It depends on your local market and how quickly you execute on the prospecting steps. The fastest closers tend to walk into shops in person within the first few days.',
              },
              {
                question: 'Is this a white-label or do I resell under the Smoke Rewards brand?',
                answer:
                  'Your agency license gives you a private-label setup for each client — their shop name, their colors, their branding. The platform is presented as your service, not ours.',
              },
              {
                question: 'What if I already have an agency?',
                answer:
                  'This is a perfect add-on service. Dozens of existing agency owners have added smoke shop rewards as a recurring revenue stream that complements their current offerings without competing with them.',
              },
            ].map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <DollarSign className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            The smoke shops are there.
            <br />
            <span className="text-yellow-400">The opportunity is real.</span>
            <br />
            The only question is whether you're in.
          </h2>
          <p className="text-gray-400 mb-10 text-lg">
            For less than dinner for two, you get everything you need to start a recurring revenue
            agency in one of the most underserved markets in the country.
          </p>
          <CtaButton size="xl">
            Yes, I Want In — Get Instant Access <ArrowRight className="h-5 w-5" />
          </CtaButton>
          <p className="text-gray-500 text-xs mt-4">
            30-day guarantee · Instant digital delivery · No subscriptions
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-gray-600 text-xs">
        <p className="mb-2">© {new Date().getFullYear()} Smoke Rewards. All rights reserved.</p>
        <p className="max-w-xl mx-auto">
          Income claims are illustrative only and not a guarantee of results. Individual results will
          vary based on effort, experience, and market conditions. This product is sold via WarriorPlus.
        </p>
      </footer>

    </div>
  )
}
