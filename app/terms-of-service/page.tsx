import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
            Terms of Service
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Product availability, colors, and sizes may vary based on current
              stock. Final order confirmation happens directly with the store team.
            </p>
            <p>
              For exchanges, sizing help, or order questions, customers should use
              the store contact options provided in the footer for the fastest
              support.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
