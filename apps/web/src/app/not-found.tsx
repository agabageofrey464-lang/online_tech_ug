import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink-600">Page not found</h1>
      <p className="mt-2 max-w-md text-ink-700/70">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-6">
        <Button href="/" variant="primary">
          Back to home
        </Button>
      </div>
    </section>
  );
}
