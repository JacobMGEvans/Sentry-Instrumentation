import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

type FormData = {
  value: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // Simulated delay to show off tracing in Sentry
    await sleep(300);

    const data = (await request.json()) as FormData;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    if (typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Value must be a number' },
        { status: 400 }
      );
    }

    if (data.value === 0) {
      // The worst kind of math
      Sentry.captureEvent({
        message: 'Division by zero error',
        contexts: { data },
      });
      throw new Error('Division by zero error');
    }

    const result = 100 / data.value;

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      result,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}
