import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  ext: {
    loadimpact: {
      projectID: 6149459,
      name: 'Smoke Test'
    }
  },
  vus: 10,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate==0'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL}/actuator/health`);

  // This will print the error to your GitHub Actions console
  if (res.status !== 200) {
    console.log(`Error: Detected status ${res.status} for URL ${res.url}`);
    console.log(`Body: ${res.body}`);
  }

  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
