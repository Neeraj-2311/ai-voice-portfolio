import { existsSync } from 'fs';
import { join } from 'path';
import { redirect } from 'next/navigation';

const PDF_PATH = join(process.cwd(), 'public', 'resume.pdf');

export function GET() {
  if (existsSync(PDF_PATH)) {
    redirect('/resume.pdf');
  }
  return new Response(
    'Resume PDF coming soon. Drop it at /public/resume.pdf to enable this route.',
    {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
}
