
const config = {
	headers: {Authorization: `Bearer `},
	timeout: 1000000
};

const getConfig = () => {
	return config;
}

const setToken = (token) => {
	config.headers = {...config.headers, Authorization: `Bearer ${token}`}
}

export {getConfig, setToken};
