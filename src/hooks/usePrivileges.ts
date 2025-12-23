import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { userDto } from '@/dto/userDto';
import { modelDto } from '@/dto/modelDto';

export type PrivilegeLevel = 'USER' | 'MODERATOR' | 'ADMIN';

export const usePrivileges = () => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const hasRole = (roleName: string): boolean => {
    return currentUser?.role.roleName === roleName;
  };

  const isModerator = (): boolean => {
    return hasRole('MODERATOR');
  };

  const isBlocked = (): boolean => {
    return currentUser?.blocked === true;
  };

  const canEditModel = (model: modelDto | null): boolean => {
    if (!currentUser || !model) return false;
    return currentUser.userId === model.owner.userId || isModerator();
  };

  const canDeleteModel = (model: modelDto | null): boolean => {
    if (!currentUser || !model) return false;
    return currentUser.userId === model.owner.userId || isModerator();
  };

  const canBlockUsers = (): boolean => {
    return isModerator();
  };

  const canManageCategories = (): boolean => {
    return isModerator();
  };

  const canViewAdminFeatures = (): boolean => {
    return isModerator();
  };

  const canAccessUserPage = (targetUserId: string): boolean => {
    if (!currentUser) return false;
    return currentUser.userId === targetUserId || isModerator();
  };

  const canUploadModels = (): boolean => {
    return !isBlocked();
  };

  const getPrivilegeLevel = (): PrivilegeLevel => {
    if (!currentUser) return 'USER';
    if (hasRole('MODERATOR')) return 'MODERATOR';
    return 'USER';
  };

  return {
    currentUser,
    hasRole,
    isModerator,
    isBlocked,
    canEditModel,
    canDeleteModel,
    canBlockUsers,
    canManageCategories,
    canViewAdminFeatures,
    canAccessUserPage,
    canUploadModels,
    getPrivilegeLevel,
  };
}; 