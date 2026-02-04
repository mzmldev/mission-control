/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 */

export declare const api: {
  agents: {
    list: any;
    get: any;
    getBySessionKey: any;
    create: any;
    updateStatus: any;
    heartbeat: any;
  };
  tasks: {
    list: any;
    get: any;
    getByStatus: any;
    getByAssignee: any;
    create: any;
    updateStatus: any;
    assign: any;
  };
  messages: {
    list: any;
    getByTask: any;
    getByAgent: any;
    create: any;
    remove: any;
  };
  activities: {
    list: any;
    getByAgent: any;
    getByTask: any;
    getRecent: any;
    create: any;
    cleanup: any;
  };
  notifications: {
    list: any;
    getByAgent: any;
    getUndelivered: any;
    create: any;
    markDelivered: any;
    markAllDelivered: any;
    remove: any;
  };
  documents: {
    list: any;
    getByTask: any;
    getByCreator: any;
    create: any;
    update: any;
    remove: any;
  };
};

export declare const internal: any;
export declare const components: {};
