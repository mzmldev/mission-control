/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 */

/** @type {any} */
const agentsList = "agents:list";
/** @type {any} */
const agentsGet = "agents:get";
/** @type {any} */
const agentsGetBySessionKey = "agents:getBySessionKey";
/** @type {any} */
const agentsCreate = "agents:create";
/** @type {any} */
const agentsUpdateStatus = "agents:updateStatus";
/** @type {any} */
const agentsHeartbeat = "agents:heartbeat";

/** @type {any} */
const tasksList = "tasks:list";
/** @type {any} */
const tasksGet = "tasks:get";
/** @type {any} */
const tasksGetByStatus = "tasks:getByStatus";
/** @type {any} */
const tasksGetByAssignee = "tasks:getByAssignee";
/** @type {any} */
const tasksCreate = "tasks:create";
/** @type {any} */
const tasksUpdateStatus = "tasks:updateStatus";
/** @type {any} */
const tasksAssign = "tasks:assign";

/** @type {any} */
const messagesList = "messages:list";
/** @type {any} */
const messagesGetByTask = "messages:getByTask";
/** @type {any} */
const messagesGetByAgent = "messages:getByAgent";
/** @type {any} */
const messagesCreate = "messages:create";
/** @type {any} */
const messagesRemove = "messages:remove";

/** @type {any} */
const activitiesList = "activities:list";
/** @type {any} */
const activitiesGetByAgent = "activities:getByAgent";
/** @type {any} */
const activitiesGetByTask = "activities:getByTask";
/** @type {any} */
const activitiesGetRecent = "activities:getRecent";
/** @type {any} */
const activitiesCreate = "activities:create";
/** @type {any} */
const activitiesCleanup = "activities:cleanup";

/** @type {any} */
const notificationsList = "notifications:list";
/** @type {any} */
const notificationsGetByAgent = "notifications:getByAgent";
/** @type {any} */
const notificationsGetUndelivered = "notifications:getUndelivered";
/** @type {any} */
const notificationsCreate = "notifications:create";
/** @type {any} */
const notificationsMarkDelivered = "notifications:markDelivered";
/** @type {any} */
const notificationsMarkAllDelivered = "notifications:markAllDelivered";
/** @type {any} */
const notificationsRemove = "notifications:remove";

/** @type {any} */
const documentsList = "documents:list";
/** @type {any} */
const documentsGetByTask = "documents:getByTask";
/** @type {any} */
const documentsGetByCreator = "documents:getByCreator";
/** @type {any} */
const documentsCreate = "documents:create";
/** @type {any} */
const documentsUpdate = "documents:update";
/** @type {any} */
const documentsRemove = "documents:remove";

export const api = {
  agents: {
    list: agentsList,
    get: agentsGet,
    getBySessionKey: agentsGetBySessionKey,
    create: agentsCreate,
    updateStatus: agentsUpdateStatus,
    heartbeat: agentsHeartbeat,
  },
  tasks: {
    list: tasksList,
    get: tasksGet,
    getByStatus: tasksGetByStatus,
    getByAssignee: tasksGetByAssignee,
    create: tasksCreate,
    updateStatus: tasksUpdateStatus,
    assign: tasksAssign,
  },
  messages: {
    list: messagesList,
    getByTask: messagesGetByTask,
    getByAgent: messagesGetByAgent,
    create: messagesCreate,
    remove: messagesRemove,
  },
  activities: {
    list: activitiesList,
    getByAgent: activitiesGetByAgent,
    getByTask: activitiesGetByTask,
    getRecent: activitiesGetRecent,
    create: activitiesCreate,
    cleanup: activitiesCleanup,
  },
  notifications: {
    list: notificationsList,
    getByAgent: notificationsGetByAgent,
    getUndelivered: notificationsGetUndelivered,
    create: notificationsCreate,
    markDelivered: notificationsMarkDelivered,
    markAllDelivered: notificationsMarkAllDelivered,
    remove: notificationsRemove,
  },
  documents: {
    list: documentsList,
    getByTask: documentsGetByTask,
    getByCreator: documentsGetByCreator,
    create: documentsCreate,
    update: documentsUpdate,
    remove: documentsRemove,
  },
};

export const internal = {};
export const components = {};
