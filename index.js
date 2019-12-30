const Axios = require('axios');

const config = {
  componentId: process.env.componentId,
  lambstatusAPIBaseURL: process.env.lambstatusAPIBaseURL,
  lambstatusAPIKey: process.env.lambstatusAPIKey,
  name: process.env.name,
  namespace: process.env.namespace,
  type: process.env.type
};

const getStatus = async () => {
  if (!(config.k8sBaseURL)) {
    config.k8sBaseURL = 'http://localhost:8080/apis';
  }
  const ret = {
    componentId: config.componentId,
    name: config.name
  };
  try {
    const axios = Axios.create({
      baseURL: config.k8sBaseURL
    });
    const result = await axios.get(`apps/v1/namespaces/${config.namespace}/${config.type}/${config.name}`);
    const statuses = Array.from(result.data.status.conditions).filter(x => x.type === 'Available');
    if (statuses.length !== 1) {
      throw new Error('status !== 1');
    } else {
      ret.status = statuses[0].status === 'True' ? 'Operational' : 'Partial Outage';
      ret.description = statuses[0].message;
    }  
  } catch (e) {
    ret.status = 'Major Outage';
    ret.description = '';
    console.error(e);
  }
  return ret;
}

const sendStatus = (ret) => {
  const axios = Axios.create({
    baseURL: config.lambstatusAPIBaseURL,
    headers: {
      'x-api-key': config.lambstatusAPIKey
    }
  });
  return axios.patch(`v0/components/${ret.componentId}`, ret);
};

getStatus().then(sendStatus).then(console.dir).catch(console.error);

