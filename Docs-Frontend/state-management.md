# State Management

Hybrid 3-tier architecture:

| Type | Tool | Stores |
|---|---|---|
| Client global | Zustand (persist) | Auth, App, Chat |
| Server / API | Fetch + local state (+ TanStack Query) | Brands, Tags, Products, … |
| Component | useState / useReducer | Forms, modals |

## Zustand Stores

### useAuthStore
```
state:    user, accessToken, refreshToken, isAuthenticated
actions:  setAuth(user, tokens), logout(), updateUser(data)
```

### useAppStore
```
state:    theme (light / dark / system), sidebarOpen, isInitialized
actions:  setTheme(mode), toggleSidebar()
```

### useChatStore
```
state:    isOpen, sessionId, messages[], unreadCount
actions:  addMessage(msg), updateLastMessage(partial), clearMessages()
```

## Best Practices

- **Selective subscribe** — `useAuthStore(s => s.user)` instead of destructuring the whole store
- **Do not persist** sensitive data (tokens, passwords) in Zustand persist — use httpOnly cookies for refresh tokens
- **Refresh after mutation** — always invalidate TanStack Query cache after admin CRUD operations
- **Streaming** — `useChatStore.updateLastMessage` is designed for real-time AI streaming updates
