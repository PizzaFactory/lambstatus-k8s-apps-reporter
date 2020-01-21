const lambstatus = require('./lambstatus-api');
const moment = require('moment-timezoune');
moment.tz.setDefault('UTC');

const IN_PROGRESS = 'In Progress';
const VERIFYING = 'Verifying'

const checker = async () => {
  const maintenances = await lambstatus.listMaintenances();
  const incidents = await lambstatus.listIncidents();

  const workings = maintenances
    .filter(x => (x !== 'Completed' && moment().after(moment(x.startAt))))

  const moveToInProgressPromises = working
    .filter(x => (x.status === 'Scheduled'))
    .map(x => lambstatus.updateSchedule(x.maintenanceID, {
      status: IN_PROGRESS
    }));

  const overrunsPromises = working
    .filter(x => (x.status === IN_PROGRESS && moment().isAfter(moment(x.endAt).add(15, 'm'))))
    .map(x => {
      const incidents = incidents
        .filter(i => i.name.includes(`:${x.maintenanceID}:`));
      if (incidents.length === 0) {
        return lambstatus.createIncident({
          name: `Maintenance window overrun :${x.maintenanceID}:`,
          status: 'Investigating',
          message: 'Statements will be told by our SRE team.'
        });
      }
    });
      
  const completedPromises = working
    .filter(x => (x.status === VERIFYING && moment().isAfter(moment(x.endAt)))
    .map(x => lambstatus.updateSchedule(x.maintenanceID, {
      status: COMPLETED
    }));

  return Promise.all([
    moveToInProgressPromises,
    overrunsPromises,
    completedPromises
  ]);
}
