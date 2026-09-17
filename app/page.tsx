import Image from "next/image"
import Link from "next/link"

const products = [
  { id: 1, name: "Starter Dreadlock Kit", price: 899, image: "/products/starter-kit.png" },
  { id: 2, name: "Professional Dreadlock Kit", price: 1499, image: "/products/pro-kit.png" },
  { id: 3, name: "Premium Care Kit", price: 1899, image: "/products/premium-kit.png" },
  { id: 4, name: "Daily Care Kit", price: 699, image: "/products/care-kit.png" },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-semibold tracking-wide">DREADLOCK SHOP</Link>
          <Link href="/cart" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Кошик</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-20">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">Natural care. Strong roots.</p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">Все для здорових і стильних дредів.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">Професійні набори для створення, догляду та підтримки дредлоків.</p>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden bg-muted">
              <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-col gap-2 p-5">
              <h2 className="font-medium">{product.name}</h2>
              <p className="text-sm text-muted-foreground">{product.price} грн</p>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
