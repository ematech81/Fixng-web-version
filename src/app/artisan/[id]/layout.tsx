import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const APP_KEY = process.env.APP_KEY ?? '';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const fallback: Metadata = {
    title: 'Artisan Profile — FixNG',
    description: "View and book a verified artisan on FixNG, Nigeria's professional marketplace.",
  };

  try {
    const res = await fetch(`${API_URL}/api/artisans/${params.id}`, {
      headers: { 'x-app-key': APP_KEY },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallback;

    const json = await res.json();
    const a = json.data ?? json.artisan ?? json;
    const name: string = a.name ?? 'Artisan';
    const skills: string[] = a.skills ?? [];
    const state: string = a.location?.state ?? 'Nigeria';
    const bio: string | null = a.bio ?? null;
    const photo: string | null = a.profilePhoto ?? null;

    const skillStr = skills.slice(0, 3).join(', ');
    const title = `${name} — ${skillStr || 'Professional'} in ${state} | FixNG`;
    const description =
      bio
        ? `${bio.slice(0, 155)}…`
        : `Book ${name}, a verified ${skillStr || 'professional'} in ${state} on FixNG.`;

    return {
      title,
      description,
      openGraph: {
        title: `${name} | FixNG`,
        description,
        type: 'profile',
        locale: 'en_NG',
        siteName: 'FixNG',
        ...(photo && { images: [{ url: photo, alt: name }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | FixNG`,
        description,
      },
    };
  } catch {
    return fallback;
  }
}

export default function ArtisanProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
