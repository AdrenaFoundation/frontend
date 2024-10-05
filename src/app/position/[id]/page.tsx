import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const product = { title: `Product ${id}` };

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product.title,
    openGraph: {
      images: [
        'https://frontend-devnet-git-pnlshare-adrena.vercel.app/api/og?username=position' +
          id,
        ...previousImages,
      ],
    },
  };
}

export default function Page({ params, searchParams }: Props) {
  return (
    <div>
      <h1>Product: {params.id}</h1>
      <p>Search params: {JSON.stringify(searchParams)}</p>
    </div>
  );
}
