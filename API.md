# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All authenticated endpoints require an `Authorization` header:

```
Authorization: Bearer {access_token}
```

## Endpoints

### Authentication

#### Sign Up
- **POST** `/auth/signup`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "User Name"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User created successfully. Please check your email for verification.",
    "user": { /* user object */ }
  }
  ```
- **Error Response (400):**
  ```json
  {
    "error": "Error message"
  }
  ```

#### Login
- **POST** `/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "user": { /* user object */ },
    "session": { /* session data */ }
  }
  ```

#### Logout
- **POST** `/auth/logout`
- **Response (200):**
  ```json
  {
    "message": "Logout successful"
  }
  ```

---

### Blog Posts

#### Get All Posts
- **GET** `/posts`
- **Query Parameters:**
  - `page` (number, default: 1) - Page number for pagination
  - `limit` (number, default: 10) - Posts per page
  - `published` (boolean) - Filter by published status
  - `userId` (string) - Filter by user ID
- **Response (200):**
  ```json
  {
    "posts": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "title": "Post Title",
        "content": "Post content...",
        "excerpt": "Short excerpt",
        "image_url": "https://...",
        "slug": "post-title",
        "published": true,
        "ai_generated": false,
        "views": 100,
        "likes": 25,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```

#### Get Single Post
- **GET** `/posts/{id}`
- **Response (200):** Single post object
- **Error Response (404):**
  ```json
  {
    "error": "Post not found"
  }
  ```

#### Create Post
- **POST** `/posts`
- **Requires Authentication:** ✓
- **Request Body:**
  ```json
  {
    "title": "My Blog Post",
    "content": "The full content of the blog post...",
    "excerpt": "A short excerpt (optional)",
    "image_url": "https://example.com/image.jpg",
    "published": false,
    "ai_generated": false,
    "userId": "uuid"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "Post created successfully",
    "post": { /* post object */ }
  }
  ```

#### Update Post
- **PUT** `/posts/{id}`
- **Requires Authentication:** ✓
- **Request Body:** (all fields optional)
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content...",
    "excerpt": "Updated excerpt",
    "image_url": "https://...",
    "published": true
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Post updated successfully",
    "post": { /* updated post object */ }
  }
  ```

#### Delete Post
- **DELETE** `/posts/{id}`
- **Requires Authentication:** ✓
- **Response (200):**
  ```json
  {
    "message": "Post deleted successfully"
  }
  ```

---

### AI Generation

#### Generate Blog Content
- **POST** `/ai/generate`
- **Request Body:**
  ```json
  {
    "prompt": "Write about React hooks",
    "tone": "professional",
    "userId": "uuid"
  }
  ```
- **Tone Options:** `professional`, `casual`, `academic`, `creative`
- **Response (200):**
  ```json
  {
    "content": "# React Hooks\n\nReact Hooks are functions that let you use state and other React features...",
    "titleOptions": [
      "Understanding React Hooks",
      "A Complete Guide to React Hooks",
      "React Hooks Explained"
    ],
    "excerpt": "Learn how to use React Hooks to manage state and side effects in your functional components..."
  }
  ```
- **Error Response (500):**
  ```json
  {
    "error": "Failed to generate content. Please try again."
  }
  ```

---

### Admin

#### Get All Users
- **GET** `/admin/users`
- **Requires Authentication:** ✓ (Admin only)
- **Response (200):**
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "User Name",
        "role": "user",
        "avatar_url": "https://...",
        "bio": "User bio",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### Update User Role
- **PUT** `/admin/users`
- **Requires Authentication:** ✓ (Admin only)
- **Request Body:**
  ```json
  {
    "userId": "uuid",
    "role": "admin"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "User updated successfully",
    "user": { /* updated user object */ }
  }
  ```

---

## Error Handling

### Common Error Responses

**400 Bad Request**
```json
{
  "error": "Field validation error message"
}
```

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- No rate limiting on free tier
- Production: Implement rate limiting via Supabase or middleware

---

## CORS

CORS is enabled for `http://localhost:3000` in development.

For production, update CORS configuration in your deployment settings.

---

## Code Examples

### JavaScript/TypeScript

```typescript
import { apiService } from '@/services/api';

// Create a post
const post = await apiService.createPost(
  'My First Blog Post',
  'This is the content...',
  'user-id',
  { published: false }
);

// Generate content with AI
const generated = await apiService.generateBlogContent(
  'Write about web development',
  'user-id',
  'professional'
);

// Update post
const updated = await apiService.updatePost('post-id', {
  published: true,
  title: 'Updated Title'
});
```

### cURL

```bash
# Create post
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Post",
    "content": "Post content...",
    "userId": "user-id",
    "published": false
  }'

# Generate AI content
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about AI",
    "tone": "professional",
    "userId": "user-id"
  }'
```

---

## WebSocket/Real-time (Future)

Coming soon: Real-time features using Supabase subscriptions
