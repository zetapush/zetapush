// NodeJS modules
import { URL } from 'url';
// ThirdPart modules
import axios from 'axios';

export const download = (url: URL | string) =>
  axios({
    method: 'GET',
    url: url.toString()
  }).then((response) => response.data);
