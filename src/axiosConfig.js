
const BASE_URL = 'http://localhost:8080/';
const TIMEOUT = 5000;

const config = {
	headers: {Authorization: `Bearer `},
	baseURL: BASE_URL,
	timeout: TIMEOUT
};

const getConfig = () => {
	return config;
}

const setToken = (token) => {
	config.headers = {...config.headers, Authorization: `Bearer ${token}`}
}

export {getConfig, setToken};
