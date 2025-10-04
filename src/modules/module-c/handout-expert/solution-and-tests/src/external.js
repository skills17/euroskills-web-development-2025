import axios from 'axios';

function client() {
    const baseURL = process.env.EXTERNAL_API_BASE_URL || 'http://localhost:9090';
    const token = process.env.EXTERNAL_API_TOKEN || '';
    const timeout = Number(process.env.EXTERNAL_API_TIMEOUT_MS || 3000);
    const inst = axios.create({baseURL, timeout});
    inst.interceptors.request.use((cfg) => {
        cfg.headers = cfg.headers || {};
        if (token) cfg.headers['Authorization'] = `Bearer ${token}`;
        return cfg;
    });
    return inst;
}

const http = client();

export async function fetchTurbines() {
    const {data} = await http.get('/turbines');
    return data; // { timestamp, data: [ ... ] }
}

export async function fetchLogs(turbineId) {
    const {data} = await http.get(`/turbines/${turbineId}/logs`, {responseType: 'text'});
    return data; // plaintext
}

export async function postStatus(turbineId, newStatus) {
    const {data} = await http.post(`/turbines/${turbineId}/status`, {status: newStatus}, {
        headers: {'Content-Type': 'application/json'},
        responseType: 'text'
    });
    return data;
}
