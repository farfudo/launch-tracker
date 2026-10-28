// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { RocketFlightInteractive } from '../components/rocket-flight-interactive';
import { rocketFlightCopy } from '../lib/rocket-flight';

it.each(['en-GB','pt-PT','es-ES'] as const)('explains forces and gives quiz feedback in %s',async locale=>{
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const container=document.createElement('div'); const root=createRoot(container); const t=rocketFlightCopy[locale];
 try {
  await act(async()=>root.render(<RocketFlightInteractive locale={locale}/>));
  expect(container.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(t.diagram);
  const force=container.querySelectorAll('.flight-force-buttons button');
  await act(async()=>{(force[2] as HTMLButtonElement).click();});
  expect(force[2].getAttribute('aria-pressed')).toBe('true'); expect(container.textContent).toContain(t.forceText[2]);
  const answers=container.querySelectorAll('.flight-quiz-options button');
  await act(async()=>{(answers[0] as HTMLButtonElement).click();}); expect(container.textContent).toContain(t.incorrect);
  await act(async()=>{(answers[1] as HTMLButtonElement).click();}); expect(container.textContent).toContain(t.correct);
 } finally {await act(async()=>root.unmount());}
});
