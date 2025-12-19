import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  ext: {
    loadimpact: {
      projectID: 6149459,
      name: 'Stress Test'
    }
  },
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 150 },
    { duration: '3m', target: 300 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/api/orders`);
  check(res, {
    'no 5xx': r => r.status < 500,
  });
  sleep(1);
}
