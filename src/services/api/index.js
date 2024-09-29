import {API_BASE_URL} from '../config';
import { Auth } from './auth.ts';
import axios from 'axios';

export * from './auth';
export * from './main';

export const apiGetRequest = async endPoint => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }
  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
  );
  return new Promise((resolve, reject) => {
    fetch(API_BASE_URL + endPoint, {
      method: 'GET',
      headers,
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (!res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};

export const apiPostRequest = async (endPoint, data) => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }
  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
    data,
  );
  return new Promise((resolve, reject) => {
    fetch(API_BASE_URL + endPoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (!res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};

export const apiPatchRequest = async (endPoint, data) => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }
  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
    data,
  );
  return new Promise((resolve, reject) => {
    fetch(API_BASE_URL + endPoint, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (!res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};

export const apiPostRequestBody = async (endPoint, data) => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }

  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
    data,
  );

  return new Promise((resolve, reject) => {
    fetch(API_BASE_URL + endPoint, {
      method: 'POST',
      headers,
      body: data,
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (!res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};

export const apiPostFileRequest = async (endPoint, data) => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }
  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
    data,
  );
  return new Promise((resolve, reject) => {
    fetch(API_BASE_URL + endPoint, {
      method: 'POST',
      headers,
      body: data,
    })
      .then(res => {
        return res.json();
      })
      .then(res => {
        if (!res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};

export const axiosPostFileRequest = async (endPoint, data) => {
  const accessToken = await Auth.getAccessToken();
  var headers = {
    Accept: 'application/json',
    'Content-Type': 'multipart/form-data',
  };
  if (accessToken) {
    headers.accessToken = accessToken;
  }
  console.log(
    '%c API ' + endPoint,
    'background: #33AAFF; color: #FFF',
    headers,
    data,
  );

  console.log(JSON.stringify(data));
  return new Promise((resolve, reject) => {
    axios({
      url: API_BASE_URL + endPoint,
      method: 'POST',
      headers,
      data: JSON.stringify(data),
    })
      .then(res => {
        if (res.data) {
          console.log(
            '%c API res ' + endPoint,
            'background: #009944; color: #FFF',
            res,
          );
          resolve(res);
        } else {
          console.log(
            '%c API res error ' + endPoint,
            'background: #FF6600; color: #FFF',
            res,
          );
          reject(res.message);
        }
      })
      .catch(error => {
        console.log(
          '%c API error ' + endPoint,
          'background: #DD0000; color: #FFF',
          error,
        );
        reject('Oops! something went wrong');
      });
  });
};
