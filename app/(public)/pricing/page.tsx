import { Metadata } from "next";
import Link from "next/link";
import { PlanService } from "@/lib/services/plan.service";
import { Check, Sparkles, ArrowLeft, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Pricing Plans | Pimple Saudagar Directory",
  description:
    "Explore transparent pricing plans for local businesses in Pimple Saudagar. Boost your neighborhood reach, leads, and customer reviews.",
};

export default async function PricingPage() {
  const plans = await PlanService.getActivePlans();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              PS
            </div>
            <span className="font-bold tracking-tight text-sm text-foreground">
              Pimple Saudagar Directory
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container py-16 max-w-6xl flex-1">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>TRANSPARENT NEIGHBORHOOD PRICING</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Promote Your Business in Pimple Saudagar
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Choose the right visibility plan to connect with thousands of local residents and high-intent customers in Kokane Chowk, Kunal Icon Rd, and Shivar Chowk.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan) => {
            const isFeatured = plan.slug === "standard" || plan.slug === "premium";
            const isPopular = plan.slug === "standard";

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border bg-card p-8 shadow-card flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover ${
                  isPopular
                    ? "border-primary ring-2 ring-primary/20 md:-translate-y-2"
                    : "hover:border-primary/40"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="my-6 pb-6 border-b">
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                      {plan.priceMinor === 0
                        ? "₹0"
                        : `₹${(plan.priceMinor / 100).toLocaleString("en-IN")}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium ml-1.5">
                      {plan.priceMinor === 0 ? "forever free" : "/ year"}
                    </span>
                  </div>

                  {/* Entitlements Checklist */}
                  <ul className="space-y-3 text-xs mb-8">
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Up to <strong>{plan.maxPhotos}</strong> business photos</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Listed in up to <strong>{plan.maxCategories}</strong> categories</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Coverage across <strong>{plan.maxLocations}</strong> localities</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Direct <strong>Call & WhatsApp</strong> action buttons</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          plan.badgeVisible ? "text-emerald-600" : "text-muted-foreground/30"
                        }`}
                      />
                      <span className={plan.badgeVisible ? "font-semibold" : "text-muted-foreground line-through"}>
                        Verified Business Trust Badge
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          plan.featuredAllowed ? "text-emerald-600" : "text-muted-foreground/30"
                        }`}
                      />
                      <span className={plan.featuredAllowed ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted-foreground line-through"}>
                        Homepage Spotlight & Top Search Placement
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  href={`/submit?plan=${plan.slug}`}
                  className={`w-full text-center py-3 px-4 rounded-xl text-xs font-bold transition shadow-xs block ${
                    isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary-600"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {plan.priceMinor === 0 ? "List Business for Free" : `Select ${plan.name}`}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto rounded-2xl border bg-card p-8 shadow-card">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-foreground mb-1">
                How does business verification work in Pimple Saudagar?
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                When you claim or submit a business listing, our local moderation team verifies the physical address and contact phone in Pimple Saudagar within 24 hours before activating the Verified badge.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-bold text-foreground mb-1">
                Can I upgrade or downgrade my plan later?
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Yes. You can upgrade from the Free tier to Standard or Premium at any time from your Business Owner Dashboard. Pro-rated duration is applied automatically.
              </p>
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-bold text-foreground mb-1">
                What payment methods are supported?
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                We accept UPI (Google Pay, PhonePe, Paytm), Net Banking, RuPay, and all major Indian Credit & Debit Cards via our secure payment gateway.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
