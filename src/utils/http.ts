import { Toast } from "@douyinfe/semi-ui";
import { createHttp as createBaseHttp } from "@safe-fe/utils";
import { stringify } from "qs";

export function createHttp(baseURL = "", mapRes = (v: any) => v) {
  return createBaseHttp({
    baseURL,
    paramsSerializer(params) {
      return stringify(params, { arrayFormat: "repeat" });
    },
    timeout: 60000,
    interceptResponse(response) {
      return mapRes(response);
    },
    handleError(error) {
      const { config, response } = error;
      const { disableErrorHandle, formatErrorMessage } = config;
      let msg = response?.data?.detail || error.message;

      if (formatErrorMessage) {
        msg = formatErrorMessage(msg);
      }

      if (!disableErrorHandle) {
        Toast.error(msg);
      }
    },
  });
}

export const http = createHttp("/api", (res) => res.data);
