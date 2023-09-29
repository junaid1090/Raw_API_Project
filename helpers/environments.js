/*
 *title: Environments
 *Description: HANDLE All Environment Related things
 *Date: 01-03-2023
 *
 */

// module saffolding
const environments = {};

environments.staging = {
    port: 9000,
    envName: 'staging',
    secretKey: 'fgsdzfghgdgf',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: 'AC3a9288c3fe4737ba9bef9edd5ee0faa6',
        authToken: '3ed57f996b19ae1bce9b9a1bdfda1158',
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'sdfkshbfasldf',
    maxChecks: 5,
    twilio: {
        fromPhone: '',
        accountSid: 'AC3a9288c3fe4737ba9bef9edd5ee0faa6',
        authToken: '3ed57f996b19ae1bce9b9a1bdfda1158',
    }
};

// determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// expot corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

// expot module
module.exports = environmentToExport;
