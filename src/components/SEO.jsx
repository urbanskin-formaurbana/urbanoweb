export default function SEO({ title, description }) {
  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
    </>
  )
}
