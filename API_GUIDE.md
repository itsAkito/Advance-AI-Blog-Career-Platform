# API & Backend Integration Guide

## Overview

AiBlog is structured to support serverless backend using Next.js API Routes. This guide explains how to integrate with MongoDB and build RESTful APIs.

## API Route Structure

Next.js API routes are in the `app/api` directory (to be created):

```
app/
└── api/
    ├── posts/
    │   ├── route.ts          # GET /api/posts, POST /api/posts
    │   └── [id]/
    │       └── route.ts      # GET/PUT/DELETE /api/posts/[id]
    ├── users/
    │   ├── route.ts
    │   └── [id]/
    │       └── route.ts
    ├── auth/
    │   ├── login/
    │   │   └── route.ts
    │   └── register/
    │       └── route.ts
    └── ai-assistant/
        ├── generate-title/
        │   └── route.ts
        ├── summarize/
        │   └── route.ts
        └── check-tone/
            └── route.ts
```

## Setting Up MongoDB

### 1. Install MongoDB Driver

```bash
npm install mongodb
# or use Prisma for ORM
npm install @prisma/client prisma
```

### 2. Create `.env.local`

```bash
# .env.local (not committed to git)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiblog?retryWrites=true&w=majority
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Create MongoDB Connection Utility

Create `lib/mongodb.ts`:

```typescript
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";

let cachedClient: MongoClient | null;

export async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  return client;
}

export async function getDatabase() {
  const client = await connectToDatabase();
  return client.db("aiblog");
}
```

## API Route Patterns

### Basic GET Endpoint

Create `app/api/posts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const posts = await db.collection("posts").find({}).toArray();

    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
```

### POST Endpoint with Body

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const result = await db.collection("posts").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 400 }
    );
  }
}
```

### Dynamic Route with Parameters

Create `app/api/posts/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const post = await db.collection("posts").findOne({
      _id: new ObjectId(params.id),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(params.id),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}
```

## Connecting Frontend to Backend

### 1. Create API Client Hook

Create `hooks/useApi.ts`:

```typescript
import { useState, useCallback } from "react";

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (
      url: string,
      options?: RequestInit
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, request };
}
```

### 2. Use in Components

```typescript
"use client";

import { useEffect } from "react";
import { useApi } from "@/hooks/useApi";

interface Post {
  _id: string;
  title: string;
  content: string;
}

export default function PostsList() {
  const { data: posts, loading, request } = useApi<Post[]>();

  useEffect(() => {
    request("/api/posts");
  }, [request]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {posts?.map((post) => (
        <div key={post._id}>
          <h2>{post.title}</h2>
        </div>
      ))}
    </div>
  );
}
```

## Data Models

### Post Schema

```typescript
interface Post {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: "Tech" | "Career" | "Business" | "Lifestyle";
  author: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  views: number;
  likes: number;
  comments: number;
  readTime: number; // in minutes
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Schema

```typescript
interface User {
  _id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: "creator" | "mentor" | "user";
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  stats: {
    totalPosts: number;
    totalViews: number;
    averageEngagement: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## AI Assistant API Endpoints

### Generate Title

```typescript
// app/api/ai-assistant/generate-title/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // Call your AI service here (OpenAI, Anthropic, etc.)
    // This is a placeholder
    const title = `Auto-Generated Title for: ${content.substring(0, 30)}...`;

    return NextResponse.json({ title }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate title" },
      { status: 400 }
    );
  }
}
```

### Check Tone

```typescript
// app/api/ai-assistant/check-tone/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    // Analyze tone of content
    const analysis = {
      tone: "professional", // or "casual", "formal", "friendly"
      sentiment: "positive", // or "negative", "neutral"
      suggestions: [
        "Consider adding more direct language",
        "Try varied sentence structure",
      ],
    };

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check tone" },
      { status: 400 }
    );
  }
}
```

## Authentication Pattern

### Create Auth Route

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const db = await getDatabase();

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token (use jsonwebtoken)
    // Return user data and token

    return NextResponse.json(
      { user: { id: user._id, email: user.email, name: user.name } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
```

## Error Handling

### Custom Error Responses

```typescript
interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

function createErrorResponse(error: ApiError) {
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
    },
    { status: error.statusCode }
  );
}
```

## CORS Handling

```typescript
// For cross-origin requests, add headers
export function GET(request: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_API_URL);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  // Your route logic here
}
```

## Environment Configuration

Create `.env.local`:

```bash
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/aiblog

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# AI Services (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...

# Authentication
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Middleware for API Protection

```typescript
// lib/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function protectedRoute(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token
    try {
      // Verify JWT token
      return handler(request);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  };
}
```

## Testing API Endpoints

### Using cURL

```bash
# GET request
curl http://localhost:3000/api/posts

# POST request
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"..."}'

# DELETE request
curl -X DELETE http://localhost:3000/api/posts/123
```

### Using Postman

1. Import API endpoints
2. Set base URL: `http://localhost:3000/api`
3. Create requests for each endpoint
4. Test with sample data

## Deployment Considerations

- Use environment variables for sensitive data
- Implement rate limiting on API routes
- Add request validation and sanitization
- Use CORS headers appropriately
- Implement proper error logging
- Monitor API performance

## Resources

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MongoDB Node Driver](https://www.mongodb.com/docs/drivers/node/)
- [TypeScript API Documentation](https://www.typescriptlang.org/docs/)

---

**Ready to build your backend?** Start by creating the `app/api` directory and first route!
