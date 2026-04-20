/**
 * FORMA URBANA brand text using SVG paths from the loading animation logo
 * Reusable component that can be scaled and styled via props
 */

export default function FormaBrandSVG({ size = 100, variant = 'stacked', color = 'white' }) {
  // SVG paths extracted from the loading logo (#fu-forma and #fu-urbana)
  const formaPath = (
    <>
      <path d="M39.07,92.23v-11.22h8.26v2.77h-5.43v1.62h4.51v2.4h-4.51v4.44h-2.83Z"/>
      <path d="M47.51,86.64c.03-3.59,2.85-5.8,6.07-5.8s5.96,2.29,5.95,5.8c-.03,3.4-2.63,5.76-5.96,5.76s-6.09-2.28-6.05-5.76ZM56.69,86.64c-.02-2.04-1.31-3.4-3.13-3.4s-3.22,1.36-3.22,3.4c.02,1.97,1.38,3.37,3.22,3.37s3.11-1.38,3.13-3.37Z"/>
      <path d="M60.35,92.23v-11.22h4.77c3.7,0,4.62,1.97,4.62,3.71s-.62,3.15-2.52,3.55l-.36.02,2.37,3.94h-3.15l-2.3-3.94h-.6v3.94h-2.82ZM63.17,86.01h1.95c1.14,0,1.78-.36,1.78-1.29,0-.85-.55-1.31-1.8-1.31h-1.94v2.6Z"/>
      <path d="M70.57,92.23v-11.22h2.97l3.16,6.34,3.23-6.34h2.96v11.22h-2.82v-5.92l-2.49,5.92h-1.8l-2.39-5.85v5.85h-2.83Z"/>
      <path d="M83.72,92.23l5.07-11.22h2.7l5.1,11.22h-2.97l-1.4-3.08h-4.13l-1.4,3.08h-2.96ZM89.07,87h2.16l-1.07-2.4-1.09,2.4Z"/>
    </>
  );

  const urbanaPath = (
    <>
      <path d="M38.95,103.09v-4.42h2.72v4.42c0,1.29.71,2.12,1.91,2.09,1.21-.02,1.94-.92,1.94-2.26v-4.25h2.82v8.62h-2.71v-2.04c-.32,1.51-1.71,2.19-2.92,2.21-2.19.03-3.77-1.58-3.77-4.37Z"/>
      <path d="M49.14,107.29v-8.62h2.72v2.09c.45-1.92,2.77-2.7,4.52-1.72l-1.44,2.24c-1-.87-2.94-.02-2.94,1.7v4.3h-2.86Z"/>
      <path d="M59.88,105.28v2.01h-2.71v-11.22h2.72v4.59c.37-1.43,1.79-2.14,3.09-2.16,2.24-.03,3.97,1.65,3.97,4.52,0,2.48-1.73,4.47-4.12,4.44-1.29-.02-2.59-.87-2.96-2.18ZM64.23,103c0-1.41-.91-2.26-2.11-2.24-1.18.03-2.12.85-2.12,2.24,0,1.27.96,2.12,2.11,2.16,1.18.02,2.12-.85,2.12-2.16Z"/>
      <path d="M67.73,103.02c0-2.87,1.71-4.56,3.95-4.52,1.31.02,2.72.73,3.1,2.16v-1.99h2.72v8.62h-2.71v-2.01c-.37,1.31-1.68,2.16-2.97,2.18-2.39.03-4.1-1.96-4.1-4.44ZM74.67,103c0-1.38-.93-2.21-2.11-2.24-1.2-.02-2.12.83-2.12,2.24,0,1.31.95,2.18,2.12,2.16,1.16-.03,2.11-.88,2.11-2.16Z"/>
      <path d="M78.29,107.29v-8.62h2.72v1.99c.37-1.43,1.79-2.14,3.09-2.16,2.24-.03,3.97,1.65,3.97,4.52v4.27h-2.72v-4.28c0-1.41-.91-2.26-2.11-2.24-1.18.03-2.12.85-2.12,2.24v4.28h-2.82Z"/>
      <path d="M88.84,103.02c0-2.87,1.71-4.56,3.95-4.52,1.31.02,2.72.73,3.1,2.16v-1.99h2.72v8.62h-2.71v-2.01c-.37,1.31-1.68,2.16-2.97,2.18-2.39.03-4.1-1.96-4.1-4.44ZM95.78,103c0-1.38-.93-2.21-2.11-2.24-1.2-.02-2.12.83-2.12,2.24,0,1.31.95,2.18,2.12,2.16,1.16-.03,2.11-.88,2.11-2.16Z"/>
    </>
  );

  // Tightly cropped viewBox around just the FORMA and URBANA text (no background space)
  // X: 38-96 (width ~58), Y: 80-107 (height ~27, reduced vertical spacing)
  const viewBoxWidth = 58;
  const viewBoxHeight = 27;

  if (variant === 'stacked') {
    // FORMA on top, URBANA below (reduced spacing)
    return (
      <svg
        viewBox="38 80 58 27"
        width={size}
        height={(size * viewBoxHeight) / viewBoxWidth}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        style={{ display: 'inline-block' }}
      >
        <g style={{ fill: color }}>
          {formaPath}
          {urbanaPath}
        </g>
      </svg>
    );
  }

  if (variant === 'inline') {
    // FORMA only (for single line)
    return (
      <svg
        viewBox="38 80 58 12"
        width={size}
        height={(size * 12) / 58}
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <g style={{ fill: color }}>
          {formaPath}
        </g>
      </svg>
    );
  }

  return null;
}
