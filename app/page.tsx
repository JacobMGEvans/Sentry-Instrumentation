'use client';

import { useState, useEffect, FormEvent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/nextjs';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="p-3 text-sm text-red-600" role="alert">
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary} className="underline">
        Try again
      </button>
    </div>
  );
}

function BadMathForm({ number }: { number: number }) {
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCalculation() {
      await Sentry.startSpan({ name: 'fetchCalculation' }, async (span) => {
        span.setAttribute('number', number);
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: number }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error fetching calculation');
        }
        setResult(data.result);
        span.end();
      });
    }
    fetchCalculation().catch((err) => setError(err));
  }, [number]);

  if (error) throw error;

  return <p>{result !== null ? `Result: ${result}` : 'Loading...'}</p>;
}

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [submittedValue, setSubmittedValue] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (!inputValue.trim()) {
      setErrorMessage('Enter a number');
      return;
    }

    const numValue = Number(inputValue);
    if (isNaN(numValue)) {
      setErrorMessage('Invalid number');
      return;
    }

    setSubmittedValue(numValue);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 text-sm">
      <h1 className="text-lg font-semibold">Calculation Form</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-xs mt-4 space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          placeholder="Enter a number"
        />
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        <button
          type="submit"
          className="w-full p-2 bg-black text-white rounded"
        >
          Calculate
        </button>
      </form>

      {submittedValue !== null && (
        <div className="mt-4">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => setSubmittedValue(null)}
          >
            <BadMathForm number={submittedValue} />
          </ErrorBoundary>
        </div>
      )}
    </main>
  );
}
