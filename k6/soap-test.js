import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  ext: {
    loadimpact: {
      projectID: 6149459,
      name: 'Soap Test'
    }
  },
  vus: 50,
  duration: '2h',
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  http.get(`${__ENV.BASE_URL}/api/orders`);
  sleep(1);
}
