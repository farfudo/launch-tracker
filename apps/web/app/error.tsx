"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main>
      <header>
        <p className="eyebrow">LaunchSkyline · Lançamentos espaciais</p>
        <h1>Não foi possível carregar os lançamentos.</h1>
        <p className="intro">Confirma que a API local está ativa e tenta novamente.</p>
        <button onClick={reset} type="button">Tentar novamente</button>
      </header>
    </main>
  );
}
