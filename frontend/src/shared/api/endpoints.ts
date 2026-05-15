export const endpoints = {
  auth: {
    login: "/api/auth/login/",
    register: "/api/auth/register/",
    refresh: "/api/auth/refresh/",
    me: "/api/auth/me/",
    applicantProfile: "/api/auth/applicant/profile/",
    resetPassword: "/api/auth/reset-password/",
    resetPasswordConfirm: "/api/auth/reset-password/confirm/",
    favorites: "/api/auth/favorites/",
    favoriteById: (id: number | string) => `/api/auth/favorites/${id}/`,
  },
  languages: {
    list: "/unipage/api/languages/",
  },
  universities: {
    list: "/unipage/api/universities/",
    byCode: (code: string) => `/unipage/api/universities/${code}/`,
    /** @deprecated use byCode */
    byId: (id: number | string) => `/unipage/api/universities/${id}/`,
    edit: (code: string) => `/unipage/api/universities/${code}/edit/`,
  },
  fields: {
    list: "/unipage/api/fields/",
  },
  programs: {
    list: "/unipage/api/programs/",
    byCode: (code: string) => `/unipage/api/programs/${code}/`,
    /** @deprecated use byCode */
    byId: (id: number | string) => `/unipage/api/programs/${id}/`,
  },
  subjects: {
    list: "/unipage/api/subjects/",
  },
  universityPrograms: {
    list: "/unipage/api/university-programs/",
    byCode: (code: string) => `/unipage/api/university-programs/${code}/`,
    /** @deprecated use byCode */
    byId: (id: number | string) => `/unipage/api/university-programs/${id}/`,
    byUniversity: (universityCode: string) =>
      `/unipage/api/university-programs/?university=${universityCode}`,
  },
  myUniversity: {
    detail: "/unipage/api/my-university/",
    info: "/unipage/api/my-university/info/",
    programs: "/unipage/api/my-university/programs/",
    programByCode: (code: string) => `/unipage/api/my-university/programs/${code}/`,
    /** @deprecated use programByCode */
    programById: (id: number | string) => `/unipage/api/my-university/programs/${id}/`,
    languages: "/unipage/api/my-university/languages/",
    languageById: (id: number | string) => `/unipage/api/my-university/languages/${id}/`,
    requirements: "/unipage/api/my-university/requirements/",
    requirementById: (id: number | string) => `/unipage/api/my-university/requirements/${id}/`,
    exams: "/unipage/api/my-university/exams/",
    examById: (id: number | string) => `/unipage/api/my-university/exams/${id}/`,
    mobility: "/unipage/api/my-university/mobility/",
    mobilityById: (id: number | string) => `/unipage/api/my-university/mobility/${id}/`,
    applicants: "/unipage/api/my-university/applicants/",
    accreditations: "/unipage/api/my-university/accreditations/",
    accreditationById: (id: number | string) => `/unipage/api/my-university/accreditations/${id}/`,
    uploadLogo: "/unipage/api/my-university/upload-logo/",
    uploadCover: "/unipage/api/my-university/upload-cover/",
  },
  announcements: {
    list: "/api/announcements/",
    byId: (id: number | string) => `/api/announcements/${id}/`,
    deleteById: (id: number | string) => `/api/announcements/${id}/delete/`,
    updateById: (id: number | string) => `/api/announcements/${id}/update/`,
    ntcDeleteById: (id: number | string) => `/api/announcements/${id}/ntc-delete/`,
    ntcUpdateById: (id: number | string) => `/api/announcements/${id}/ntc-update/`,
    createNtc: "/api/announcements/ntc/",
    createUniversity: "/api/announcements/university/",
  },
  grants: {
    check: "/api/announcements/grants/check/",
  },
  chat: {
    root: "/api/chat/",
  },
  calendar: {
    list: "/api/calendar/",
    myUniversity: "/api/calendar/my-university/",
    myUniversityById: (id: number | string) => `/api/calendar/my-university/${id}/`,
  },
} as const;