import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-6 text-muted-foreground">
            <p>
              Pickup Jiristore only uses customer details needed to respond to
              product questions, process orders, and provide purchase support.
            </p>
            <p>
              If you contact the store through WhatsApp or phone, the information
              you share is used only for store communication and customer service.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
