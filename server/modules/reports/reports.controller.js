import * as service from './reports.service.js';

const currentUser = (req) => req.user ?? req.session?.user ?? null;

export async function create(req, res) {
  const reporter = currentUser(req);
  const result = await service.createReport(reporter.id, req.validated.params.id, req.validated.body);
  const { autoBlocked, autoSuspended, reportCount, ...report } = result;
  res.status(201).json({ report, autoBlocked, autoSuspended, reportCount });
}

export async function list(req, res) {
  res.json(await service.listReports(req.validated.query));
}

export async function setStatus(req, res) {
  const report = await service.setReportStatus(req.validated.params.id, req.validated.body.status);
  res.json({ report });
}
