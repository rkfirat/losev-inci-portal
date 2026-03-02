import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.sub;
    const userRole = (req as any).user.role;
    const data = await DashboardService.getDashboardData(userId, userRole);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await DashboardService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
