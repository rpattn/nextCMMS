import { apiServer } from './apiServer';

export type UserResponseDTO = {
  id: number;
  email: string;
  name?: string;
  role?: { code?: string };
  // optional profile image fields coming from backend
  avatar?: string;
  profileImageUrl?: string;
  picture?: string;
  image?: { url?: string; path?: string; publicUrl?: string } | null;
  parentSuperAccount?: { superUserId: number } | null;
};

export async function getMe() {
  return apiServer<UserResponseDTO>('auth/me');
}

