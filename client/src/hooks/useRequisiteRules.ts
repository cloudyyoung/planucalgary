import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RequisiteRuleListReqQuery, RequisiteRuleListResBody } from "@planucalgary/shared";
import api from "@/api";

export const useRequisiteRules = (props: RequisiteRuleListReqQuery) => {
  const result = useQuery<RequisiteRuleListResBody>({
    queryKey: ["requisite-rules", ...Object.values(props)],
    queryFn: async () => {
      const response = await api.get("/requisite-rules", {
        params: props,
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  return result;
};
