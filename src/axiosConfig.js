
const config = {
	headers: {Authorization: `Bearer `}
};

const getConfig = () => {
	return config;
}

const setToken = (token) => {
	config.headers = {...config.headers, Authorization: `Bearer ${token}`}
}

export {getConfig, setToken};
