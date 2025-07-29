export interface Profile {
  id: number;
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  postsCount: number;
  coverPhoto: string;
  avatar: string;
}

export type TabType = 'posts' | 'replies' | 'media' | 'likes';
