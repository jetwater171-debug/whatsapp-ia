import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-strong w-full max-w-md p-8">
        <p className="eyebrow">Acesso</p>
        <h1 className="mt-4 text-3xl text-balance">Entrar na operacao</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Use o seu email para receber um link magico e acessar o painel.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
