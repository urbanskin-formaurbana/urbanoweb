import * as Sentry from '@sentry/react'

export function SentryTestButton() {
  const handleTestError = () => {
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Test Error Button Click',
      },
      () => {
        throw new Error('This is your first Sentry error!')
      }
    )
  }

  const handleTestCapture = () => {
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Test Capture Button Click',
      },
      () => {
        try {
          throw new Error('This is a captured test error')
        } catch (error) {
          Sentry.captureException(error, {
            tags: {
              section: 'testing',
              component: 'SentryTestButton',
            },
            level: 'info',
          })
        }
      }
    )
  }

  return (
    <div style={{ padding: '10px', display: 'flex', gap: '10px' }}>
      <button
        onClick={handleTestError}
        style={{
          padding: '8px 12px',
          backgroundColor: '#f05a28',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Test Sentry Error
      </button>
      <button
        onClick={handleTestCapture}
        style={{
          padding: '8px 12px',
          backgroundColor: '#0051ba',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Test Sentry Capture
      </button>
    </div>
  )
}
