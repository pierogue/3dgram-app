# Privilege System Documentation

## Overview

The privilege system provides a centralized way to check user permissions throughout the application. It uses a custom hook `usePrivileges` and a `ProtectedComponent` wrapper to ensure consistent privilege checking.

## User Roles

The application supports the following roles:
- **USER**: Basic user with limited permissions
- **MODERATOR**: Can manage content, categories, and users
- **ADMIN**: Full administrative access

## Using the Privilege Hook

### Basic Usage

```typescript
import { usePrivileges } from '@/hooks/usePrivileges';

const MyComponent = () => {
  const { 
    currentUser,
    isModerator,
    canEditModel,
    canDeleteModel,
    canManageCategories 
  } = usePrivileges();

  // Check if user is a moderator
  if (isModerator()) {
    // Show moderator features
  }

  // Check if user can edit a specific model
  if (canEditModel(model)) {
    // Show edit button
  }
};
```

### Available Methods

#### Role Checks
- `hasRole(roleName: string)`: Check if user has a specific role
- `isModerator()`: Check if user is moderator or admin
- `isAdmin()`: Check if user is admin
- `getPrivilegeLevel()`: Get user's privilege level ('USER', 'MODERATOR', 'ADMIN')

#### Permission Checks
- `canEditModel(model: modelDto | null)`: Check if user can edit a model
- `canDeleteModel(model: modelDto | null)`: Check if user can delete a model
- `canBlockUsers()`: Check if user can block other users
- `canManageCategories()`: Check if user can manage categories
- `canViewAdminFeatures()`: Check if user can view admin features
- `canAccessUserPage(targetUserId: string)`: Check if user can access a user's page
- `canUploadModels()`: Check if user can upload models

#### Status Checks
- `isBlocked()`: Check if user is blocked

## Using ProtectedComponent

The `ProtectedComponent` wrapper can protect entire sections of UI based on privileges:

```typescript
import { ProtectedComponent } from '@/components/ProtectedComponent/ProtectedComponent';

const MyPage = () => {
  return (
    <div>
      {/* Content visible to all users */}
      <h1>Welcome</h1>
      
      {/* Content only visible to moderators */}
      <ProtectedComponent requiredPrivilege="MODERATOR">
        <AdminPanel />
      </ProtectedComponent>
      
      {/* Content only visible to specific role */}
      <ProtectedComponent requiredRole="ADMIN">
        <SuperAdminPanel />
      </ProtectedComponent>
      
      {/* Content with custom fallback */}
      <ProtectedComponent 
        requiredPrivilege="MODERATOR" 
        fallback={<p>You need moderator access to view this content</p>}
      >
        <ModeratorOnlyContent />
      </ProtectedComponent>
    </div>
  );
};
```

## Migration Guide

### Before (Old Pattern)
```typescript
// Direct role checking
if (currentUser?.role.roleName === 'MODERATOR') {
  // Show moderator features
}

// Ownership + role checking
if (currentUser?.userId === model?.owner.userId || currentUser?.role.roleName === 'MODERATOR') {
  // Allow edit
}
```

### After (New Pattern)
```typescript
const { canManageCategories, canEditModel } = usePrivileges();

// Simple role checking
if (canManageCategories()) {
  // Show moderator features
}

// Ownership + role checking
if (canEditModel(model)) {
  // Allow edit
}
```

## Best Practices

1. **Use the hook instead of direct role checking**: Always use `usePrivileges()` instead of directly accessing `currentUser.role.roleName`

2. **Use specific permission methods**: Instead of checking roles, use specific permission methods like `canEditModel()`, `canDeleteModel()`, etc.

3. **Use ProtectedComponent for UI protection**: Wrap components that should only be visible to certain users with `ProtectedComponent`

4. **Centralize privilege logic**: All privilege-related logic should go through the `usePrivileges` hook

5. **Handle edge cases**: Always check for null/undefined users before checking privileges

## Examples

### Model Card with Edit Button
```typescript
const ModelCard = ({ model }) => {
  const { canEditModel } = usePrivileges();
  
  return (
    <Card>
      <img src={model.cover} />
      <h3>{model.title}</h3>
      
      {canEditModel(model) && (
        <Link href={`/edit-page/${model.modelID}`}>
          <Button>Edit</Button>
        </Link>
      )}
    </Card>
  );
};
```

### Admin Dashboard
```typescript
const AdminDashboard = () => {
  const { isAdmin, canManageCategories } = usePrivileges();
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {canManageCategories() && (
        <CategoryManagement />
      )}
      
      {isAdmin() && (
        <UserManagement />
      )}
    </div>
  );
};
```

### Protected Route
```typescript
const ModeratorPage = () => {
  return (
    <ProtectedComponent 
      requiredPrivilege="MODERATOR"
      fallback={<div>Access denied. Moderator privileges required.</div>}
    >
      <ModeratorContent />
    </ProtectedComponent>
  );
};
``` 