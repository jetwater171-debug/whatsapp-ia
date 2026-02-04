import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-[32px] p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Acesso
        </p>
        <h1 className="mt-3 text-3xl">Entrar na operação</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use o seu email para receber um link mágico e acessar o painel.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
