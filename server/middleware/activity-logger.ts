import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

interface Activity {
  timestamp: Date;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
  duration: number;
}

const activityLog: Activity[] = [];

export function activityLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  if (req.path.startsWith('/assets') || req.path === '/api/health') {
    return next();
  }
  
  const activity: Activity = {
    timestamp: new Date(),
    method: req.method,
    path: req.path,
    ip: req.ip || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
    duration: 0,
  };
  
  res.on('finish', () => {
    activity.duration = Date.now() - startTime;
    activityLog.push(activity);
    
    if (activityLog.length > 1000) {
      activityLog.shift();
    }
    
    logger.info(`Activity: ${activity.method} ${activity.path} [${activity.duration}ms]`);
  });
  
  next();
}

export function getActivityStats() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  const recentActivity = activityLog.filter(a => a.timestamp.getTime() > oneHourAgo);
  
  return {
    total: activityLog.length,
    lastHour: recentActivity.length,
    avgDuration: recentActivity.length > 0
      ? Math.round(recentActivity.reduce((sum, a) => sum + a.duration, 0) / recentActivity.length)
      : 0,
    topPaths: getTopPaths(recentActivity),
  };
}

function getTopPaths(activities: Activity[]) {
  const pathCounts = activities.reduce((acc, a) => {
    acc[a.path] = (acc[a.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path, count]) => ({ path, count }));
}
