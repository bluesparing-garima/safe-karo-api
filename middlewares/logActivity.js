import ActivityLog from '../models/adminModels/activityLogSchema.js'; 
const logActivity = (req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    const activityLog = new ActivityLog({
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      request: JSON.stringify(req.body),
      response: body,
      partnerId: req.body.partnerId || req.query.partnerId || null, 
      createdBy: req.body.createdBy || 'system', 
    });

    activityLog.save().catch(err => {
      console.error('Error saving activity log:', err);
    });

    originalSend.apply(res, arguments);
  };

  next();
};

export default logActivity;
