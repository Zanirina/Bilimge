import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { Announcement, CreateAnnouncementRequest } from "../model/types";

export const announcementsService = {
  getList: (authorType?: "ntc" | "university") =>
    http.get<Announcement[]>(endpoints.announcements.list, {
      params: authorType ? { author_type: authorType } : undefined,
    }),

  getById: (id: number) =>
    http.get<Announcement>(endpoints.announcements.byId(id)),

  createNtc: (data: CreateAnnouncementRequest) =>
    http.post<Announcement>(endpoints.announcements.createNtc, data),

  createUniversity: (data: CreateAnnouncementRequest) =>
    http.post<Announcement>(endpoints.announcements.createUniversity, data),

  deleteUniversity: (id: number) =>
    http.delete(endpoints.announcements.deleteById(id)),

  deleteNtc: (id: number) =>
    http.delete(endpoints.announcements.ntcDeleteById(id)),
};
