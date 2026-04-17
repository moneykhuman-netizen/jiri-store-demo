import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const sizeGuideRows = [
  { uk: "6", footLength: "24.5 cm" },
  { uk: "7", footLength: "25.4 cm" },
  { uk: "8", footLength: "26.2 cm" },
  { uk: "9", footLength: "27.1 cm" },
  { uk: "10", footLength: "27.9 cm" },
];

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-serif font-bold text-foreground md:text-4xl">
            Size Guide
          </h1>
          <p className="mt-4 text-muted-foreground">
            Use this quick guide as a reference before placing your order. If you
            are between sizes, choose the fit that feels most comfortable for your
            usual footwear style.
          </p>

          <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-2 border-b border-border bg-secondary/50 px-5 py-4 text-sm font-semibold text-foreground">
              <span>UK Size</span>
              <span>Approx. Foot Length</span>
            </div>
            <div className="divide-y divide-border">
              {sizeGuideRows.map((row) => (
                <div
                  key={row.uk}
                  className="grid grid-cols-2 px-5 py-4 text-sm text-muted-foreground"
                >
                  <span>{row.uk}</span>
                  <span>{row.footLength}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Measuring Tip
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Stand on a sheet of paper, mark the heel and longest toe, then
              measure the distance in centimeters. If you need help confirming the
              right size, contact the store team on WhatsApp before ordering.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
