export default function SEO({
  title = 'URBANO | Estética en Montevideo',
  description = 'Centro de estética en Montevideo, Uruguay. Tratamientos faciales, corporales y de belleza integral.',
  keywords = 'estética, belleza, depilación, masajes, Montevideo, Uruguay, tratamientos faciales',
  image,
  url,
}) {
  const metaUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {metaUrl && <meta property="og:url" content={metaUrl} />}
      {image && <meta property="og:image" content={image} />}
      <meta property="og:locale" content="es_UY" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {metaUrl && <link rel="canonical" href={metaUrl} />}
    </>
  )
}
