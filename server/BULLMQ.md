# BullMQ - Course Crawl Queue

BullMQ is set up to handle asynchronous course crawling from the University of Calgary course API.

## Quick Start

1. **Start Redis**: `docker-compose up -d`
2. **Update .env**: Add `REDIS_URL=redis://localhost:6379`
3. **Start server**: `npm run dev` (workers start automatically)

## Course Crawl

The `/courses/crawl` endpoint now queues the crawl job instead of running synchronously.

### Trigger a Crawl

```bash
# Crawl all courses
POST /courses/crawl

# Crawl specific batches
POST /courses/crawl?startBatch=0&endBatch=10
```

Response:
```json
{
  "message": "Course crawl job queued",
  "jobId": "123",
  "state": "waiting",
  "status": "queued"
}
```

### Monitor Progress

```bash
# Get queue status
GET /queue/course-crawl/status

# Get specific job
GET /queue/course-crawl/:jobId
```

### Worker Details

- **Concurrency**: 1 (processes one crawl at a time)
- **Retry attempts**: 3 with exponential backoff
- **Progress tracking**: Reports progress percentage
- **Batch processing**: 100 courses per batch

## Architecture

```
server/src/queue/
├── config.ts                      # BullMQ configuration
├── index.ts                       # Exports
├── queues/
│   └── course-crawl.queue.ts      # Queue definition
└── workers/
    └── course-crawl.worker.ts     # Worker processor
```

## Usage in Code

```typescript
import { startCourseCrawl, courseCrawlQueue } from "./queue"

// Start crawl
const jobId = await startCourseCrawl({
  startBatch: 0,
  endBatch: 10
})

// Get job status
const job = await courseCrawlQueue.getJob(jobId)
const state = await job?.getState()
const progress = job?.progress
```

## Adding More Queues

See [examples in the codebase](server/src/queue/) for how to create additional queues for other background tasks.

## Resources

- [BullMQ Docs](https://docs.bullmq.io/)
- [Queue Config](server/src/queue/config.ts)
- [Course Crawl Worker](server/src/queue/workers/course-crawl.worker.ts)
