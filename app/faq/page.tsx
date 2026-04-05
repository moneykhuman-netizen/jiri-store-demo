import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const faqs = [
  {
    question: "How can I place an order?",
    answer:
      "Browse the catalog, open any product, choose your size and color, then continue with the WhatsApp order flow.",
  },
  {
    question: "Do you offer exchanges?",
    answer:
      "Yes. For exchange questions, please use the WhatsApp option in the footer so the store team can guide you directly.",
  },
  {
    question: "How do I get sizing help?",
    answer:
      "You can open the Size Guide from the footer for quick measuring tips and general fit guidance before ordering.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
            FAQ
          </h1>
          <p className="mt-4 text-muted-foreground">
            Quick answers to the most common questions about shopping with Pickup
            Jiristore.
          </p>

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {item.question}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
