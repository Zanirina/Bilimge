export const endpoints = {
  auth: {
    login: "/api/auth/login/",
    register: "/api/auth/register/",
    me: "/api/auth/me/",
    applicantProfile: "/api/auth/applicant/profile/",
  },
  universities: {
    list: "/unipage/api/universities/",
    byId: (id: number | string) => `/unipage/api/universities/${id}/`,
  },
  fields: {
    list: "/unipage/api/fields/",
  },
  programs: {
    list: "/unipage/api/programs/",
    byId: (id: number | string) => `/unipage/api/programs/${id}/`,
  },
  subjects: {
    list: "/unipage/api/subjects/",
  },
  universityPrograms: {
    list: "/unipage/api/university-programs/",
    byId: (id: number | string) => `/unipage/api/university-programs/${id}/`,
    byUniversity: (universityId: number | string) =>
      `/unipage/api/university-programs/?university=${universityId}`,
  },
  myUniversity: {
    detail: "/unipage/api/my-university/",
    programs: "/unipage/api/my-university/programs/",
    programById: (id: number | string) =>
      `/unipage/api/my-university/programs/${id}/`,
  },
  chat: {
    root: "/api/chat/",
  },
} as const;