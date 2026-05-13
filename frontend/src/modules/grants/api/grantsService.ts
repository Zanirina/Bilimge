import { http } from "../../../shared/api/http";
import { endpoints } from "../../../shared/api/endpoints";
import type { GrantCheckResponse } from "../model/types";

export const grantsService = {
  checkGrant: (ikt: string) =>
    http.get<GrantCheckResponse>(endpoints.grants.check, { params: { ikt } }),
};
