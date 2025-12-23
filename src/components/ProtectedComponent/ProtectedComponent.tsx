import React from 'react';
import { usePrivileges } from '@/hooks/usePrivileges';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredPrivilege?: 'USER' | 'MODERATOR' | 'ADMIN';
  requiredRole?: string;
  fallback?: React.ReactNode;
  checkOwnership?: (userId: string) => boolean;
  targetUserId?: string;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requiredPrivilege = 'USER',
  requiredRole,
  fallback = null,
  checkOwnership,
  targetUserId,
}) => {
  const {
    currentUser,
    hasRole,
    isModerator,
    getPrivilegeLevel,
    canAccessUserPage,
  } = usePrivileges();

  if (!currentUser) {
    return <>{fallback}</>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  const userPrivilegeLevel = getPrivilegeLevel();
  const privilegeLevels: Record<string, number> = {
    'USER': 1,
    'MODERATOR': 2,
  };

  if (privilegeLevels[userPrivilegeLevel] < privilegeLevels[requiredPrivilege]) {
    return <>{fallback}</>;
  }

  if (checkOwnership && targetUserId) {
    if (!canAccessUserPage(targetUserId)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}; 