"use client"
import React, { useState } from "react"

function JsonBox({ data }: { data: any }) {
  return (
    <pre className="whitespace-pre-wrap bg-white/5 p-4 rounded-md text-sm overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

function GraphSvg({ path }: { path: any }) {
  if (!path || !path.nodes) return <div>No path to render</div>
  const nodes = path.nodes
  const rels = path.relationships || []
  const w = Math.max(300, nodes.length * 180)
  const h = 200
  const cx = (i: number) => 80 + i * 180
  const cy = (i: number) => h / 2

  // map node internal id to index
  const idToIndex: Record<number, number> = {}
  nodes.forEach((n: any, i: number) => (idToIndex[n.id] = i))

  return (
    <div className="overflow-auto border rounded bg-white p-4">
      <svg width={Math.min(w, 1200)} height={h} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#374151" />
          </marker>
        </defs>

        {rels.map((r: any, i: number) => {
          const start = idToIndex[r.start]
          const end = idToIndex[r.end]
          if (start === undefined || end === undefined) return null
          const x1 = cx(start)
          const y1 = cy(start)
          const x2 = cx(end)
          const y2 = cy(end)
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth={2} markerEnd="url(#arrow)" />
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} fontSize={12} fill="#374151" textAnchor="middle">{r.type}</text>
            </g>
          )
        })}

        {nodes.map((n: any, i: number) => {
          const x = cx(i)
          const y = cy(i)
          const props = n.properties || {}
          const label = props.name || props.id || (`${n.labels ? n.labels[0] : 'Node'}:${n.id}`)
          return (
            <g key={n.id}>
              <circle cx={x} cy={y} r={32} fill="#eef2ff" stroke="#6366f1" strokeWidth={2} />
              <text x={x} y={y} fontSize={12} fill="#111827" textAnchor="middle" dominantBaseline="middle">{label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function GraphPage() {
  const [mentors, setMentors] = useState<any>(null)
  const [peers, setPeers] = useState<any>(null)
  const [relation, setRelation] = useState<any>(null)
  const [aId, setAId] = useState("")
  const [bId, setBId] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // create states
  const [personId, setPersonId] = useState("")
  const [personName, setPersonName] = useState("")
  const [newSkillName, setNewSkillName] = useState("")
  const [mentorId, setMentorId] = useState("")
  const [menteeId, setMenteeId] = useState("")
  const [knowsPersonId, setKnowsPersonId] = useState("")
  const [knowsSkillName, setKnowsSkillName] = useState("")

  const base = process.env.NEXT_PUBLIC_API_BASE || ""

  function buildUrl(path: string) {
    if (!path.startsWith("/")) path = `/${path}`
    return base ? `${base}${path}` : path
  }

  async function loadMentors() {
    setLoading(true)
    try {
      const res = await fetch(buildUrl(`/mentors`))
      setMentors(await res.json())
    } catch (e) {
      setMentors({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  async function loadPeers() {
    setLoading(true)
    try {
      const res = await fetch(buildUrl(`/peers`))
      setPeers(await res.json())
    } catch (e) {
      setPeers({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  async function loadRelation() {
    setLoading(true)
    try {
      const res = await fetch(buildUrl(`/relation/${encodeURIComponent(aId)}/${encodeURIComponent(bId)}`))
      setRelation(await res.json())
    } catch (e) {
      setRelation({ error: String(e) })
    } finally {
      setLoading(false)
    }
  }

  function extractNodeProps(nodeWrapper: any, key = "mentor") {
    try {
      const node = nodeWrapper[key] || nodeWrapper
      return node.properties || {}
    } catch (e) {
      return nodeWrapper
    }
  }

  async function postJson(path: string, body: any) {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch(buildUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(JSON.stringify(data))
      setMsg("Success")
      return data
    } catch (e: any) {
      setMsg(String(e))
      return { error: String(e) }
    } finally {
      setLoading(false)
    }
  }

  async function createPerson() {
    const data = await postJson(`/people`, { id: personId, name: personName })
    setMentors(data)
  }

  async function createSkill() {
    const data = await postJson(`/skills`, { name: newSkillName })
    setPeers(data)
  }

  async function createMentorship() {
    const data = await postJson(`/relations/mentorship`, { mentor_id: mentorId, mentee_id: menteeId })
    setRelation(data)
  }

  async function createKnows() {
    const data = await postJson(`/relations/knows`, { person_id: knowsPersonId, skill_name: knowsSkillName })
    setRelation(data)
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Graph API Explorer</h1>

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-medium">Mentors</h2>
            <button className="ml-auto btn-primary px-3 py-1 rounded bg-indigo-600 text-white" onClick={loadMentors} disabled={loading}>
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>
          {mentors && mentors.mentors ? (
            <ul className="space-y-2">
              {mentors.mentors.map((m: any, i: number) => {
                const p = extractNodeProps(m, "mentor")
                return (
                  <li key={i} className="p-2 border rounded bg-white">
                    <div className="font-medium">{p.name || p.id}</div>
                    <div className="text-sm text-gray-600">id: {p.id}</div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <JsonBox data={mentors ?? "Click Fetch to load mentors"} />
          )}
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-medium">Peers (shared skills)</h2>
            <button className="ml-auto btn-primary px-3 py-1 rounded bg-indigo-600 text-white" onClick={loadPeers} disabled={loading}>
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>
          <JsonBox data={peers ?? "Click Fetch to load peer pairs"} />
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-medium mb-3">Relation (shortest path)</h2>
          <div className="flex gap-2 mb-3">
            <input value={aId} onChange={(e) => setAId(e.target.value)} placeholder="A id (e.g. alice)" className="flex-1 p-2 border rounded" />
            <input value={bId} onChange={(e) => setBId(e.target.value)} placeholder="B id (e.g. dave)" className="flex-1 p-2 border rounded" />
            <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={loadRelation} disabled={loading || !aId || !bId}>
              {loading ? "Loading…" : "Fetch"}
            </button>
          </div>
          {relation && relation.relation && relation.relation[0] && relation.relation[0].path ? (
            <GraphSvg path={relation.relation[0].path} />
          ) : (
            <JsonBox data={relation ?? "Enter two ids and click Fetch"} />
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-medium mb-3">Create Data</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 border rounded bg-white">
              <div className="flex gap-2 mb-2">
                <input value={personId} onChange={(e) => setPersonId(e.target.value)} placeholder="person id" className="flex-1 p-2 border rounded" />
                <input value={personName} onChange={(e) => setPersonName(e.target.value)} placeholder="person name" className="flex-1 p-2 border rounded" />
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={createPerson} disabled={loading || !personId}>
                  Create Person
                </button>
              </div>
            </div>

            <div className="p-4 border rounded bg-white">
              <div className="flex gap-2 mb-2">
                <input value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} placeholder="skill name" className="flex-1 p-2 border rounded" />
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={createSkill} disabled={loading || !newSkillName}>
                  Create Skill
                </button>
              </div>
            </div>

            <div className="p-4 border rounded bg-white">
              <div className="flex gap-2 mb-2">
                <input value={mentorId} onChange={(e) => setMentorId(e.target.value)} placeholder="mentor id" className="p-2 border rounded" />
                <input value={menteeId} onChange={(e) => setMenteeId(e.target.value)} placeholder="mentee id" className="p-2 border rounded" />
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={createMentorship} disabled={loading || !mentorId || !menteeId}>
                  Create Mentorship
                </button>
              </div>
            </div>

            <div className="p-4 border rounded bg-white">
              <div className="flex gap-2 mb-2">
                <input value={knowsPersonId} onChange={(e) => setKnowsPersonId(e.target.value)} placeholder="person id" className="p-2 border rounded" />
                <input value={knowsSkillName} onChange={(e) => setKnowsSkillName(e.target.value)} placeholder="skill name" className="p-2 border rounded" />
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={createKnows} disabled={loading || !knowsPersonId || !knowsSkillName}>
                  Add Skill Relation
                </button>
              </div>
            </div>
          </div>
          {msg && <div className="mt-3 text-sm">{msg}</div>}
        </section>

        <p className="text-sm text-gray-600 mt-6">The UI calls the Python API at <code className="bg-gray-100 px-1 rounded">{base}</code>. Set <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_API_BASE</code> to change.</p>
      </div>
    </div>
  )
}
