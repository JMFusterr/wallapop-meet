import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Wallapop Meet
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          React + Tailwind + shadcn/ui + Storybook
        </h1>
        <p className="text-muted-foreground">
          Base de proyecto inicializada para diseñar y validar flujos de meetup.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button>Acción principal</Button>
        <Button variant="secondary">Acción secundaria</Button>
      </div>
    </main>
  )
}

export default App

