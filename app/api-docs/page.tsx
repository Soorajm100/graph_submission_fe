import React from "react"

export default function ApiDocsPage() {
  const docsUrl = process.env.NEXT_PUBLIC_API_DOCS || ""

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">API Documentation</h1>
        <p className="mb-4 text-sm text-gray-600">If your Python API exposes Swagger UI or ReDoc at a URL, set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_API_DOCS</code> to that URL to enable quick access here.</p>

        {docsUrl ? (
          <div>
            <div className="mb-4">
              <a href={docsUrl} target="_blank" rel="noreferrer" className="text-indigo-600">Open docs in new tab</a>
            </div>
            <div className="p-4 bg-white border rounded text-sm">Embedded docs are disabled for safety — open in a new tab above.</div>
          </div>
        ) : (
          <div className="p-4 bg-white border rounded text-sm">No docs URL configured. Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_API_DOCS</code> to the docs URL (e.g. https://example.com/docs) to enable a link here.</div>
        )}

        <section className="mt-6 p-4 bg-white border rounded">
          <h2 className="font-medium mb-2">Quick curl examples</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm">{
            '# Create person\n' +
            'curl -X POST -H "Content-Type: application/json" -d "{\"id\":\"eve\",\"name\":\"Eve\"}" /people\n\n' +
            '# Get mentors\n' +
            'curl /mentors\n\n' +
            '# Shortest path\n' +
            'curl /relation/alice/dave\n'
          }</pre>
        </section>
      </div>
    </div>
  )
}
