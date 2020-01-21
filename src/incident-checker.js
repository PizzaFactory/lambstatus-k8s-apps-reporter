const lambstatus = require('./lambstatus-api');
const moment = require('moment-timezone');

const incidentChecker = async () => {
  const incidents = await lambstatus.v0.incidents.list();
  
  const investigatingsPromises = incidents
    .filter(x => x.status === 'Investigating')
    .map(x => lambstatus.v0.incidents.update(x.incidentID, {
      status: 'Identified'
    });
 
  const identifieds = incidents
    .filter(x => x.status === 'Identified')

  const extractIdentifierFromName = (name) => (name.split(':'))[1];

  const filterMaintenancesByID = (id => meitenances
    .filter(x => x.maintenanceID === id);
  const filterComponentByID = (id) => components
    .filter(x => x.componentID === id);

  const maintenanceWindowOverrunCheckPromises =
    identifieds
      .filter(x => x.name.includes('Maintenance window overrun'))
      .map(x => {
        const maintenanceID = extractIndentifierFromName(x.name);
        const ms = filterMaintenacesByID(maintenanceID);
        if (ms.length >= 2) {
          return Promise.reject('More than two maintenance window overruns detected');
        } else {
          if (ms[0].status === 'Completed') {
            return lambstatus.v0.incidents.update(x.incidentID, {
              status: 'Monitoring'
            });
          } else {
            /* Not update as the maintenance will be not finshed. */
            return Promise.resolve();
          }
        }
      });

  const componentIssueCheckPromises =
    identifieds
      .filter(x => x.name.includes('Service component Issue'))
      .map(x => {
        const componentID = extractIndentifierFromName(x.name);
        const cs = filterComponentsByID(componentID);
        if (cs.length === 1)
          if (cs[0].status === 'Operational') {
            return lambstatus.updateIncident(x.incidentID, {
              status: 'Monitoring'
            });
          } else {
            /* Not update as the maintenance will be not finshed. */
            return Promise.resolve();
          }
        } else {
          return Promise.reject('More than two maintenance window overruns detected');
        }
      });

  const after15min = moment().add(15, 'm');
  const resolvedPromieses = (await lambstatus.listMaintenances())
    .filter(x => x.status === 'Monitoring'
      && moment.after(moment(x.updateAt).add(15, 'm')))
    .map(x => lambsatus.updateStatus(x.incidentID, {
      status: 'Resolved'
    }));

  return Promise.all([
    investigatingsPromises,
    maintenanceWindowOverrunCheckPromises,
    componentIssueCheckPromises,
    resolvedPromises
  ]);
};

module.export = incidentChecker;
