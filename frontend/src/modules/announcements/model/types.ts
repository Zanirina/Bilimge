export type AnnouncementAuthorType = "ntc" | "university";
export type AnnouncementTag = "event" | "scholarship" | "programme" | "update" | "";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  tag: AnnouncementTag;
  author_type: AnnouncementAuthorType;
  university_id: number | null;
  university_name: string;
  author_avatar_url?: string;
  created_at: string;
};

export type CreateAnnouncementRequest = {
  title: string;
  body: string;
  tag: AnnouncementTag;
};
