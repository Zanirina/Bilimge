export type AnnouncementAuthorType = "ntc" | "university";

export type Announcement = {
  id: number;
  title: string;
  body: string;
  author_type: AnnouncementAuthorType;
  university_id: number | null;
  university_name: string;
  created_at: string;
};

export type CreateAnnouncementRequest = {
  title: string;
  body: string;
};
