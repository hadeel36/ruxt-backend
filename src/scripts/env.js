"use strict";

exports.googleApplicationCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
exports.BigQueryProjectId = process.env.PROJECT_ID || 'chrome-ux-report-185710';
exports.dataSetName = process.env.dataSetName || 'chrome-ux-report.all.201802';
exports.ESHost = process.env.ESHOST || 'localhost:9200';