import {
  apiPostRequest,
  apiPostRequestBody,
  apiPostFileRequest,
  axiosPostFileRequest,
} from '.';

export const getclaim = req => {
  return apiPostRequestBody('mobile/user/getclaim', req);
};

export const search = req => {
  return apiPostRequestBody('mobile/user/search', req);
};

export const updateReports = req => {
  return axiosPostFileRequest('mobile/user/updatereportdata', req);
};

export const uploadZip = req => {
  return apiPostFileRequest('mobile/zipfile/upload', req);
};

export const synchronize = req => {
  return apiPostRequest('mobile/user/updatereports', req);
};
