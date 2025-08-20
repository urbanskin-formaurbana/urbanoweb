import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description }) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Helmet>
  )
}
