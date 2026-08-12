import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-[18px] text-center">
      <div className="text-[15px] font-bold tracking-[-0.01em]">cuánto cuesta cartagena</div>
      <p className="text-[12px] opacity-60">Esta página no existe.</p>
      <Link href="/es" className="text-[11px] font-semibold underline">
        Volver al inicio
      </Link>
    </div>
  );
}
