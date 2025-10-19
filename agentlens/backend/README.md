# AgentLens Backend

Business logic layer for AgentLens API operations.

## Structure

```
backend/
├── api/               # API business logic
│   ├── traces.ts     # Traces operations
│   ├── agents.ts     # Agents operations
│   └── ai.ts         # AI/ML operations
│
├── services/         # Core services
│   ├── ai.ts        # Groq AI functions
│   ├── supabase.ts  # Database client
│   └── utils.ts     # Utilities
│
├── models/          # Data models (future)
└── package.json     # Dependencies
```

## Usage

These backend classes are imported by the Next.js API routes in `frontend/app/api/`:

```typescript
// frontend/app/api/traces/route.ts
import { TracesAPI } from '../../../../backend/api/traces'

export async function GET(request: Request) {
  const supabase = await createClientServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  const traces = await TracesAPI.list(user.id)
  return NextResponse.json(traces)
}
```

## Benefits

- ✅ **Separation of Concerns** - Business logic separate from routing
- ✅ **Reusable** - Can be used in other projects or microservices
- ✅ **Testable** - Easy to unit test without HTTP layer
- ✅ **Maintainable** - Clear structure and responsibilities

## API Classes

### TracesAPI
- `list(userId, filters)` - Get all traces
- `get(traceId, userId)` - Get single trace
- `create(userId, trace)` - Create trace
- `update(traceId, userId, updates)` - Update trace
- `delete(traceId, userId)` - Delete trace
- `getDashboardStats(userId)` - Get statistics

### AgentsAPI
- `list(userId)` - Get all agents
- `get(agentId, userId)` - Get single agent
- `create(userId, agent)` - Create agent
- `update(agentId, userId, updates)` - Update agent
- `delete(agentId, userId)` - Delete agent
- `getStats(agentId, userId)` - Get agent statistics

### AIAPI
- `process(userId, request)` - Process AI operations
  - Actions: summary, anomalies, optimizations, quality, chat
- `healthCheck()` - Check AI services health

## Services

All services are in `services/` folder:

- **ai.ts** - Groq AI integration for trace analysis
- **supabase.ts** - Database client and queries
- **utils.ts** - Shared utilities

## Note

The backend folder is for **organization and reference**. The actual execution happens through Next.js API routes in the frontend, which import these classes.

This provides a clean separation while keeping everything in one monorepo.

